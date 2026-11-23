const {onDocumentCreated}=require("firebase-functions/v2/firestore");
const {defineSecret}=require("firebase-functions/params");
const nodemailer=require("nodemailer");

const GMAIL_USER=defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD=defineSecret("GMAIL_APP_PASSWORD");
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// אם מסד ה-Firestore שלכם לא ב-us-central1, הוסיפו region (למשל "me-west1") לאובייקט
exports.notifyNewLead=onDocumentCreated(
  {document:"leads/{id}",secrets:[GMAIL_USER,GMAIL_APP_PASSWORD]},
  async event=>{
    const l=event.data?.data();if(!l)return;
    const t=nodemailer.createTransport({service:"gmail",auth:{user:GMAIL_USER.value(),pass:GMAIL_APP_PASSWORD.value()}});
    await t.sendMail({
      from:`"אתר השוחרות" <${GMAIL_USER.value()}>`,
      to:GMAIL_USER.value(),
      subject:`פנייה חדשה: ${l.student||""} (${l.grade||""})`,
      html:`<div dir="rtl" style="font:16px Arial"><h2>פנייה חדשה מהאתר</h2>
        <p><b>תלמיד/ה:</b> ${esc(l.student)} (${esc(l.grade)})<br>
        <b>הורה:</b> ${esc(l.parent)}<br>
        <b>טלפון:</b> <a href="tel:${esc(l.phone)}">${esc(l.phone)}</a><br>
        <b>סוג פנייה:</b> ${esc(l.kind)}<br>
        <b>מקור:</b> ${esc(l.source)}</p>
        <p><a href="https://wa.me/${esc(String(l.phone).replace(/\D/g,"").replace(/^0/,"972"))}">שליחת וואטסאפ</a></p></div>`
    });
  });
