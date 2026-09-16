const n={whatsapp:"6285117378557",email:"2013.tib@gmail.com"},t="Halo, saya mau bertanya tentang Petualangan Pintar.",e="Pertanyaan — Petualangan Pintar",o=`Halo, saya mau bertanya tentang Petualangan Pintar.

`;function c(){const a=n.whatsapp.replace(/\D/g,"");return a?`https://wa.me/${a}?text=${encodeURIComponent(t)}`:null}function r(){const a=`subject=${encodeURIComponent(e)}&body=${encodeURIComponent(o)}`;return`mailto:${n.email}?${a}`}export{r as e,c as w};
