export const translations = {
  en: {
    welcome:"Welcome to DukaanPro", signIn:"Sign In", signUp:"Sign Up",
    demo:"Try Demo", dashboard:"DukaanPro", products:"Products", sales:"Sales",
    customers:"Customers", debts:"Debts", expenses:"Expenses", purchases:"Purchases",
    suppliers:"Suppliers", reports:"Reports", settings:"Settings", employees:"Employees",
    logout:"Sign Out", online:"ONLINE", offline:"OFFLINE", syncing:"SYNCING",
    noProducts:"No products yet", addFirst:"Add your first product"
  },
  so: {
    welcome:"Ku soo dhowow DukaanPro", signIn:"Soo gal", signUp:"Isdiiwaangeli",
    demo:"Tijaabi Demo", dashboard:"DukaanPro", products:"Alaabooyin", sales:"Iib",
    customers:"Macaamiil", debts:"Dayn", expenses:"Kharashaad", purchases:"Iibsiyo",
    suppliers:"Alaab-qeybiyeyaal", reports:"Warbixinno", settings:"Dejinta", employees:"Shaqaale",
    logout:"Ka bax", online:"ONLINE", offline:"OFFLINE", syncing:"SYNCING",
    noProducts:"Alaabooyin weli ma jiraan", addFirst:"Ku dar alaabtaada ugu horreysa"
  },
  ar: {
    welcome:"مرحباً بك في DukaanPro", signIn:"تسجيل الدخول", signUp:"إنشاء حساب",
    demo:"تجربة العرض", dashboard:"DukaanPro", products:"المنتجات", sales:"المبيعات",
    customers:"العملاء", debts:"الديون", expenses:"المصروفات", purchases:"المشتريات",
    suppliers:"الموردون", reports:"التقارير", settings:"الإعدادات", employees:"الموظفون",
    logout:"تسجيل الخروج", online:"متصل", offline:"غير متصل", syncing:"جارٍ المزامنة",
    noProducts:"لا توجد منتجات بعد", addFirst:"أضف أول منتج"
  }
};
export function setLanguage(lang){
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
}
