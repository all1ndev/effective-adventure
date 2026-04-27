import { type Article } from "./schema";

export const articles: Article[] = [
	{
		id: "1",
		title: "Ce trebuie să știți după transplantul hepatic",
		category: "recuperare",
		content: `Transplantul hepatic este o intervenție majoră care necesită o îngrijire atentă după operație. În primele luni, sistemul imunitar este suprimat pentru a preveni rejetul ficatului nou. Este esențial să urmați cu strictețe schema de medicație prescrisă de medicul dumneavoastră.

Vizitele de control regulate sunt cruciale pentru monitorizarea funcției hepatice și ajustarea dozelor de imunosupresoare. Nu ratați nicio programare și anunțați medicul dacă apar simptome noi sau neobișnuite.

Recuperarea completă durează de obicei 6-12 luni, dar mulți pacienți se simt semnificativ mai bine după primele câteva săptămâni.`,
		readTime: 5,
	},
	{
		id: "2",
		title: "Nutriție și alimentație după transplant",
		category: "nutritie",
		content: `O dietă echilibrată joacă un rol crucial în recuperarea după transplantul hepatic. Iată principalele recomandări:

**Alimente recomandate:**
- Fructe și legume proaspete (bine spălate)
- Proteine slabe: pui, pește, ouă
- Cereale integrale
- Lactate pasteurizate

**Alimente de evitat:**
- Grapefruit și suc de grapefruit (interacționează cu medicația)
- Alimente crude sau insuficient gătite
- Alcool (complet interzis)
- Alimente bogate în sodiu (cresc tensiunea arterială)

Hidratați-vă corespunzător cu minimum 2 litri de apă pe zi.`,
		readTime: 7,
	},
	{
		id: "3",
		title: "Medicația imunosupresoare — ce trebuie să știți",
		category: "medicatie",
		content: `Medicația imunosupresoare este esențială după transplantul hepatic pentru a preveni rejetul organului transplantat. Este important să înțelegeți cum funcționează și de ce trebuie luată cu strictețe.

**Tipuri comune de imunosupresoare:**
- **Tacrolimus (Prograf):** cel mai frecvent utilizat; monitorizează nivelurile serice
- **Ciclosporina:** alternativă la tacrolimus
- **Micofenolat mofetil:** adesea folosit în combinație
- **Prednison:** corticosteroid, frecvent redus treptat

**Reguli de aur:**
1. Luați medicația la aceleași ore în fiecare zi
2. Nu săriți nicio doză fără să contactați medicul
3. Nu ajustați dozele singuri
4. Anunțați orice medic/dentist că sunteți pe imunosupresoare`,
		readTime: 8,
	},
	{
		id: "4",
		title: "Semnele de alertă — când să contactați medicul",
		category: "complicatii",
		content: `După transplantul hepatic, este vital să recunoașteți semnele de alertă care necesită atenție medicală imediată.

**Contactați medicul URGENT dacă aveți:**
- Febră peste 38°C
- Icter (îngălbenirea pielii sau ochilor)
- Durere severă în zona abdominală sau în dreptul ficatului
- Urină foarte închisă la culoare
- Vărsături persistente sau sângerare
- Confuzie sau dezorientare
- Dificultăți severe de respirație

**Contactați medicul în 24 ore dacă aveți:**
- Tensiune arterială anormal de mare (>140/90)
- Umflături ale picioarelor sau abdomenului
- Oboseală extremă sau neobișnuită
- Pierdere rapidă în greutate`,
		readTime: 6,
	},
	{
		id: "5",
		title: "Activitate fizică după transplant",
		category: "stil-de-viata",
		content: `Reluarea activității fizice după transplantul hepatic trebuie făcută gradual, sub îndrumarea echipei medicale.

**Primele 6 săptămâni:**
- Plimbări scurte de 10-15 minute
- Evitați ridicarea greutăților peste 5 kg
- Evitați efortul fizic intens

**Lunile 2-6:**
- Creșteți treptat durata și intensitatea plimbărilor
- Puteți începe yoga sau exerciții ușoare de stretching
- Consultați medicul înainte de orice sport nou

**După 6 luni:**
- Majoritatea activităților fizice moderate sunt permise
- Evitați sporturile de contact
- Înotul este recomandat după vindecarea completă a inciziei

Exercițiile regulate ajută la menținerea greutății optime, îmbunătățesc calitatea somnului și reduc riscul bolilor cardiovasculare.`,
		readTime: 6,
	},
	{
		id: "6",
		title: "Sănătatea mentală după transplant",
		category: "stil-de-viata",
		content: `Transplantul hepatic este o experiență transformatoare care poate afecta starea psihologică. Este normal să aveți o varietate de emoții după intervenție.

**Emoții frecvente:**
- Gratitudine, dar și anxietate
- Teamă de rejet sau complicații
- Stres legat de medicație și vizite medicale
- Uneori, sentimente de vinovăție (supraviețuitor)

**Strategii de coping:**
- Vorbiți cu un psiholog sau consilier specializat în transplant
- Alăturați-vă unui grup de suport pentru pacienți transplantați
- Practicați tehnici de relaxare (meditație, respirație profundă)
- Mențineți o rutină zilnică structurată
- Comunicați deschis cu familia și echipa medicală`,
		readTime: 5,
	},
	{
		id: "7",
		title: "Infecții — cum să vă protejați",
		category: "complicatii",
		content: `Datorită medicației imunosupresoare, sistemul dumneavoastră imunitar este mai puțin activ, ceea ce crește riscul de infecții. Protecția împotriva infecțiilor este una dintre prioritățile principale după transplant.

**Măsuri de prevenție:**
- Spălați mâinile frecvent cu apă și săpun
- Evitați contactul cu persoane bolnave (gripă, răceală)
- Nu consumați alimente crude sau insuficient preparate
- Purtați mască în spații aglomerate în sezonul de gripă
- Mențineți igiena orală riguroasă
- Vaccinați-vă conform recomandărilor medicului (nu vaccinuri vii)

**Animale de companie:**
- Puteți păstra animale de companie, dar evitați contactul cu excrementele
- Spălați mâinile după orice contact cu animalele`,
		readTime: 7,
	},
];
