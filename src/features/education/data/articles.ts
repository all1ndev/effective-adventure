import { type Article } from "./schema";

export const articles: Article[] = [
	{
		id: "1",
		title: "Ce trebuie sa stiti dupa transplantul hepatic",
		category: "recuperare",
		content: `Transplantul hepatic este o interventie majora care necesita o ingrijire atenta dupa operatie. In primele luni, sistemul imunitar este suprimat pentru a preveni rejetul ficatului nou. Este esential sa urmati cu strictete schema de medicatie prescisa de medicul dumneavoastra.

Vizitele de control regulate sunt cruciale pentru monitorizarea functiei hepatice si ajustarea dozelor de imunosupresoare. Nu ratati nicio programare si anuntati medicul daca apar simptome noi sau neobisnuite.

Recuperarea completa dureaza de obicei 6-12 luni, dar multi pacienti se simt semnificativ mai bine dupa primele cateva saptamani.`,
		readTime: 5,
	},
	{
		id: "2",
		title: "Nutritie si alimentatie dupa transplant",
		category: "nutritie",
		content: `O dieta echilibrata joaca un rol crucial in recuperarea dupa transplantul hepatic. Iata principalele recomandari:

**Alimente recomandate:**
- Fructe si legume proaspete (bine spalate)
- Proteine slabe: pui, peste, oua
- Cereale integrale
- Lactate pasteurizate

**Alimente de evitat:**
- Grapefruit si suc de grapefruit (interactioneaza cu medicatia)
- Alimente crude sau insuficient gatite
- Alcool (complet interzis)
- Alimente bogate in sodiu (cresc tensiunea arteriala)

Hidratati-va corespunzator cu minimum 2 litri de apa pe zi.`,
		readTime: 7,
	},
	{
		id: "3",
		title: "Medicatia imunosupresoare — ce trebuie sa stiti",
		category: "medicatie",
		content: `Medicatia imunosupresoare este esentiala dupa transplantul hepatic pentru a preveni rejetul organului transplantat. Este important sa intelegeti cum functioneaza si de ce trebuie luata cu strictete.

**Tipuri comune de imunosupresoare:**
- **Tacrolimus (Prograf):** cel mai frecvent utilizat; monitorizeaza nivelurile serice
- **Ciclosporina:** alternativa la tacrolimus
- **Micofenolat mofetil:** adesea folosit in combinatie
- **Prednison:** corticosteroid, frecvent redus treptat

**Reguli de aur:**
1. Luati medicatia la aceleasi ore in fiecare zi
2. Nu sarit nicio doza fara sa contactati medicul
3. Nu ajustati dozele singuri
4. Anuntati orice medic/dentist ca sunteti pe imunosupresoare`,
		readTime: 8,
	},
	{
		id: "4",
		title: "Semnele de alerta — cand sa contactati medicul",
		category: "complicatii",
		content: `Dupa transplantul hepatic, este vital sa recunoasteti semnele de alerta care necesita atentie medicala imediata.

**Contactati medicul URGENT daca aveti:**
- Febra peste 38°C
- Icter (ingalbenirea pielii sau ochilor)
- Durere severa in zona abdominala sau in dreptul ficatului
- Urina foarte inchisa la culoare
- Varsaturi persistente sau sangerare
- Confuzie sau dezorientare
- Dificultati severe de respiratie

**Contactati medicul in 24 ore daca aveti:**
- Tensiune arteriala anormal de mare (>140/90)
- Umflaturi ale picioarelor sau abdomenului
- Oboseala extrema sau neobisnuita
- Pierdere rapida in greutate`,
		readTime: 6,
	},
	{
		id: "5",
		title: "Activitate fizica dupa transplant",
		category: "stil-de-viata",
		content: `Reluarea activitatii fizice dupa transplantul hepatic trebuie facuta gradual, sub indrumarea echipei medicale.

**Primele 6 saptamani:**
- Plimbari scurte de 10-15 minute
- Evitati ridicarea greutatilor peste 5 kg
- Evitati efortul fizic intens

**Lunile 2-6:**
- Cresteti treptat durata si intensitatea plimbarilor
- Puteti incepe yoga sau exercitii usoare de stretching
- Consultati medicul inainte de orice sport nou

**Dupa 6 luni:**
- Majoritatea activitatilor fizice moderate sunt permise
- Evitati sporturile de contact
- Inotul este recomandat dupa vindecarea completa a inciziei

Exercitiile regulate ajuta la mentinerea greutatii optime, imbunatatesc calitatea somnului si reduc riscul bolilor cardiovasculare.`,
		readTime: 6,
	},
	{
		id: "6",
		title: "Sanatatea mentala dupa transplant",
		category: "stil-de-viata",
		content: `Transplantul hepatic este o experienta transformatoare care poate afecta starea psihologica. Este normal sa aveti o varietate de emotii dupa interventie.

**Emotii frecvente:**
- Gratitudine, dar si anxietate
- Teama de rejet sau complicatii
- Stres legat de medicatie si vizite medicale
- Uneori, sentimente de vinovatie (supravietuitor)

**Strategii de coping:**
- Vorbiti cu un psiholog sau consilier specializat in transplant
- Alaturati-va unui grup de suport pentru pacienti transplantati
- Practicati tehnici de relaxare (meditatie, respiratie profunda)
- Mentineti o rutina zilnica structurata
- Comunicati deschis cu familia si echipa medicala`,
		readTime: 5,
	},
	{
		id: "7",
		title: "Infectii — cum sa va protejati",
		category: "complicatii",
		content: `Datorita medicatiei imunosupresoare, sistemul dumneavoastra imunitar este mai putin activ, ceea ce creste riscul de infectii. Protectia impotriva infectiilor este una dintre prioritatile principale dupa transplant.

**Masuri de preventie:**
- Spalati mainile frecvent cu apa si sapun
- Evitati contactul cu persoane bolnave (gripa, raceala)
- Nu consumati alimente crude sau insuficient preparate
- Purtati masca in spatii aglomerate in sezonul de gripa
- Mentineti igiena orala riguroasa
- Vaccinati-va conform recomandarilor medicului (nu vaccinuri vii)

**Animale de companie:**
- Puteti pastra animale de companie, dar evitati contactul cu excrementele
- Spalati mainile dupa orice contact cu animalele`,
		readTime: 7,
	},
];
