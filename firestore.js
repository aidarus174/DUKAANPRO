import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, orderBy, limit, onSnapshot, serverTimestamp, runTransaction,
  where
} from "firebase/firestore";
import { db } from "./firebase";

export const shopRef = (shopId) => doc(db, "shops", shopId);
export const col = (shopId, name) => collection(db, "shops", shopId, name);

export async function createShop(uid, profile){
  const shopId = uid;
  await setDoc(shopRef(shopId), {
    ownerId: uid, name: profile.name || "DukaanPro",
    currency: profile.currency || "USD", language: profile.language || "en",
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }, {merge:true});
  await setDoc(doc(db,"shops",shopId,"users",uid), {
    uid, role:"OWNER", active:true, permissions:"ALL",
    displayName:profile.displayName || "", createdAt:serverTimestamp()
  }, {merge:true});
  await setDoc(doc(db,"shops",shopId,"settings","general"), {
    taxEnabled:false, taxPercent:0, allowNegativeStock:false,
    lowStockThreshold:5, theme:"dark", updatedAt:serverTimestamp()
  }, {merge:true});
}

export function listenProducts(shopId, cb){
  return onSnapshot(query(col(shopId,"products"), orderBy("name"), limit(100)),
    snap => cb(snap.docs.map(d=>({id:d.id,...d.data()}))));
}

export async function addProduct(shopId, data, actor){
  if(!data.name?.trim()) throw new Error("Product name is required.");
  if(Number(data.retailPrice)<0 || Number(data.wholesalePrice)<0 || Number(data.purchasePrice)<0) throw new Error("Prices cannot be negative.");
  const ref=await addDoc(col(shopId,"products"), {
    ...data, name:data.name.trim(), stock:Number(data.stock||0),
    purchasePrice:Number(data.purchasePrice||0), retailPrice:Number(data.retailPrice||0),
    wholesalePrice:Number(data.wholesalePrice||0), active:true,
    createdAt:serverTimestamp(), updatedAt:serverTimestamp(),
    createdBy:actor.uid, createdByName:actor.displayName||""
  });
  await addDoc(col(shopId,"auditLogs"), {
    action:"PRODUCT_ADDED", recordId:ref.id, userId:actor.uid, userName:actor.displayName||"",
    role:actor.role, timestamp:serverTimestamp(), details:{name:data.name}
  });
  return ref.id;
}

export async function completeSale(shopId, sale, actor){
  if(!sale.items?.length) throw new Error("Cart is empty.");
  const saleRef=doc(col(shopId,"sales"));
  await runTransaction(db, async tx => {
    const itemReads=[];
    for(const item of sale.items){
      const pRef=doc(db,"shops",shopId,"products",item.productId);
      itemReads.push([item, pRef, await tx.get(pRef)]);
    }
    let total=0;
    for(const [item,,snap] of itemReads){
      if(!snap.exists()) throw new Error("Product no longer exists.");
      const p=snap.data();
      const qty=Number(item.quantity);
      if(qty<=0) throw new Error("Invalid quantity.");
      if(!p.allowNegativeStock && Number(p.stock||0)<qty) throw new Error(`Insufficient stock: ${p.name}`);
      total += qty*Number(item.unitPrice);
    }
    const discount=Number(sale.discount||0);
    total=Math.max(0,total-discount);
    const paid=Number(sale.amountPaid||0);
    const debt=Math.max(0,total-paid);
    tx.set(saleRef,{
      ...sale, transactionNo:`DP-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,
      total, debt, userId:actor.uid, employeeName:actor.displayName||"",
      role:actor.role, createdAt:serverTimestamp()
    });
    for(const [item,pRef,snap] of itemReads){
      const p=snap.data(), prev=Number(p.stock||0), next=prev-Number(item.quantity);
      tx.update(pRef,{stock:next,updatedAt:serverTimestamp()});
      const mRef=doc(col(shopId,"stockMovements"));
      tx.set(mRef,{productId:item.productId,productName:p.name,quantity:-Number(item.quantity),
        previousStock:prev,newStock:next,type:"SOLD",reason:"Sale",userId:actor.uid,
        userName:actor.displayName||"",createdAt:serverTimestamp(),saleId:saleRef.id});
    }
    if(sale.paymentMethod==="CASH" && paid>0){
      const cRef=doc(col(shopId,"cashMovements"));
      tx.set(cRef,{type:"CASH_SALE",amount:paid,referenceId:saleRef.id,
        userId:actor.uid,userName:actor.displayName||"",createdAt:serverTimestamp()});
    }
    if(debt>0){
      const dRef=doc(col(shopId,"debts"));
      tx.set(dRef,{customerId:sale.customerId||null,customerName:sale.customerName||"",
        originalAmount:debt,remainingBalance:debt,status:"UNPAID",
        sourceSaleId:saleRef.id,dueDate:sale.dueDate||null,
        userId:actor.uid,userName:actor.displayName||"",createdAt:serverTimestamp()});
    }
  });
  return saleRef.id;
}

export async function recordDebtPayment(shopId, debtId, payment, actor){
  const paymentRef=doc(col(shopId,"debtPayments"));
  await runTransaction(db, async tx=>{
    const dRef=doc(db,"shops",shopId,"debts",debtId);
    const dSnap=await tx.get(dRef);
    if(!dSnap.exists()) throw new Error("Debt not found.");
    const debt=dSnap.data(), remaining=Number(debt.remainingBalance||0), amount=Number(payment.amount||0);
    if(amount<=0 || amount>remaining) throw new Error("Invalid payment amount.");
    const next=remaining-amount;
    tx.set(paymentRef,{...payment, debtId, amount, receivedBy:actor.displayName||"",
      receivedById:actor.uid, role:actor.role, createdAt:serverTimestamp()});
    tx.update(dRef,{remainingBalance:next,status:next===0?"PAID":"PARTIALLY_PAID",
      updatedAt:serverTimestamp()});
    const cRef=doc(col(shopId,"cashMovements"));
    tx.set(cRef,{type:"DEBT_PAYMENT",amount,referenceId:paymentRef.id,
      userId:actor.uid,userName:actor.displayName||"",createdAt:serverTimestamp()});
  });
  return paymentRef.id;
}
