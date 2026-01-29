# TransplantCare App

## Tema Tezei

Opțiuni de titlu:

- "Dezvoltarea unei aplicații web pentru monitorizarea post-transplant a pacienților cu transplant hepatic"
- "Aplicație web de suport și monitorizare pentru pacienții cu transplant hepatic: Proiectare, dezvoltare și implementare"
- "Aplicație web pentru monitorizarea pacienților cu transplant hepatic"
- "Platformă web de suport pentru pacienții cu transplant de ficat"

## Termene de Referință

### Background

Pacienții cu transplant de ficat au nevoie de monitorizare medicală continuă, de respectarea programului de medicație și de sprijin în urmărirea parametrilor lor de sănătate pentru a preveni complicațiile și a asigura bunăstarea pe termen lung. Aplicația web va facilita monitorizarea periodică, reamintirea medicației și comunicarea cu personalul medical calificat, cu scopul de a îmbunătăți rezultatele pacienților, prevenirea complicațiilor și de a scădea rata spitalizărilor.

## 1. Scopul Aplicației

Crearea unui instrument digital pentru monitorizarea continuă a pacienților după transplant hepatic, asigurând respectarea tratamentului și comunicarea rapidă cu echipa medicală.

## 2. Beneficiari

Pacienții post-transplant hepatic și echipa lor medicală.

## 3. Funcționalitățile Cheie

### 3.1 Funcționalități pentru Pacienți

#### 3.1.1 Monitorizarea Sănătății

- **Trackere pentru semne vitale**: Pacienții pot introduce și urmări zilnic valorile tensiunii arteriale, temperaturii, pulsului și greutății prin interfața web.
- **Simptome și stare generală**: Pacienții pot nota simptome precum febră, oboseală, dureri abdominale, icter, etc., iar aplicația va alerta echipa medicală (prin notificări in-app) dacă apar semnale de alarmă.

#### 3.1.2 Managementul Medicației

- **Calendar de administrare**: Aplicația va include un calendar personalizat pentru administrarea imunosupresoarelor, antivirale și altor medicamente prescrise.
- **Memento pentru reînnoirea prescripțiilor**: Vizualizarea datelor de expirare a prescripțiilor și alerte in-app pentru reînnoire.

#### 3.1.3 Urmărirea Testelor de Laborator

- **Vizualizare rezultate analize**: Pacienții pot vizualiza rezultatele testelor de sânge, precum enzimele hepatice și nivelurile de imunosupresoare, etc., într-o secțiune specială.

#### 3.1.4 Comunicarea cu Echipa Medicală

- **Mesagerie securizată**: Pacienții pot folosi o funcție de mesagerie securizată în cadrul aplicației pentru a trimite întrebări non-urgente medicului, economisind timp pentru ambele părți.

#### 3.1.5 Educație și Suport Personal

- **Resurse educaționale**: Pacienții vor avea acces la materiale informative despre îngrijirea post-transplant, prevenția complicațiilor și gestionarea stilului de viață.
- **Jurnal personal**: Pacienții pot folosi un jurnal pentru a-și înregistra starea de spirit sau pentru a nota recomandări personale de la echipa medicală.

### 3.2 Funcționalități pentru Medici

#### 3.2.1 Dashboard și Monitorizare Pacienți

- **Dashboard doctor**: Vizualizare centralizată a tuturor pacienților asignați cu un overview al stării lor de sănătate.
- **Urmărirea semnelor vitale**: Acces la toate datele de semne vitale introduse de pacienți, cu visualizare grafică a tendințelor.

#### 3.2.2 Alerte și Notificări

- **Alerte automate**: Dacă valorile introduse sunt anormale sau dacă pacientul raportează simptome grave, aplicația va genera alerte automate vizibile în dashboard-ul medicului.
- **Sistem de prioritizare**: Alerte cu nivele de severitate diferite pentru a ajuta medicul să prioritizeze cazurile urgente.

#### 3.2.3 Gestionarea Medicației și Prescripțiilor

- **Vizualizare complianță medicație**: Doctor poate vedea istoric al medicamentelor administrate de pacient și alertele pentru prescripții expirate.
- **Update prescripții**: Doctor poate actualiza prescripțiile și modifica planul de tratament pentru pacienți.

#### 3.2.4 Revizuirea Testelor de Laborator

- **Acces la rezultate analize**: Medicul poate vizualiza și interpreta rezultatele testelor de laborator ale pacienților, inclusiv valorile de referință și tendinții în timp.
- **Notificări pentru valori anormale**: Alertă automată pentru rezultate anormale care necesită atenție.

#### 3.2.5 Comunicare și Notări Clinice

- **Mesagerie securizată**: Doctor poate răspunde și comunica cu pacienții prin mesagerie sigură.
- **Notări clinice**: Posibilitatea de a adăuga notări clinice și observații în fișierul pacientului.

## 4. Beneficii și Impact

- **Pentru pacienți**: Aplicația oferă un sprijin constant în gestionarea post-transplant, ceea ce poate crește aderența la tratament, reduce stresul și crește siguranța pacientului prin monitorizare constantă.
- **Pentru medici**: Aplicația reduce timpul necesar pentru evaluarea simptomelor și le permite medicilor să identifice mai rapid complicațiile posibile. Notificările automate și jurnalul pacienților oferă un istoric util la fiecare consult.

## 5. Securitate și Confidențialitate

Toate datele pacientului vor fi protejate prin criptare și accesibile doar echipei medicale autorizate. Aplicația va respecta reglementările privind protecția datelor, precum General Data Protection Regulation (GDPR) și standardele internaționale de siguranță a informațiilor de sănătate.

## 6. Tehnologie și Implementare

- **Platformă**: Aplicație web responsivă accesibilă din orice browser modern (Chrome, Safari, Firefox, Edge) pe desktop, tabletă și telefon mobil.
- **Frontend**: Interfață responsivă optimizată pentru toate dimensiunile de ecran.
- **Backend**: Utilizarea unui server securizat pentru stocarea datelor.

## 7. Funcționalități cu Integrări Terțe (Opționale - dacă va exista timp)

Următoarele funcționalități necesită integrări cu servicii terțe și vor fi implementate la final, dacă timpul permite:

### 7.1 Notificări Push

- **Push notifications pentru browser**: Notificări push pentru reamintirea administrării medicamentelor, chiar și când aplicația nu este deschisă.
- **Notificări email**: Alerte automate prin email pentru evenimente importante (valori anormale, apropierea expirării prescripțiilor).
- **Notificări SMS** (opțional): Alerte critice prin SMS pentru situații urgente.

**Tehnologii necesare**: Web Push API, servicii de email (SendGrid, AWS SES), gateway SMS (Twilio).

### 7.2 Integrare cu Dispozitive Inteligente

- **Colectare automată de date**: Integrare cu smartwatch-uri și dispozitive medicale (tensiometre inteligente, termometre) pentru importul automat al valorilor semnelor vitale.
- **API-uri pentru dispozitive**: Conectare cu Apple Health, Google Fit sau dispozitive medicale specifice.

**Tehnologii necesare**: Apple Health API, Google Fit API, API-uri producători dispozitive medicale.

### 7.3 Servicii Cloud Avansate

- **Backup automat cloud**: Sincronizare și backup automat al datelor pe servicii cloud externe.
- **Analiză avansată**: Utilizarea serviciilor de machine learning pentru detectarea automată a pattern-urilor în datele pacienților.

**Tehnologii necesare**: AWS S3/Azure Blob Storage, servicii ML (TensorFlow, AWS SageMaker).

## 8. Planul de Implementare

- **Etapa 1**: Cercetare și dezvoltare
- **Etapa 2**: Design și dezvoltarea funcționalităților principale
- **Etapa 3**: Testare cu utilizatori și optimizări
- **Etapa 4**: Lansare, training și suport tehnic
