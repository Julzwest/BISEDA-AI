import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f1a',
      color: '#ffffff',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a855f7',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Kthehu
        </button>

        <h1 style={{ color: '#a855f7', marginBottom: '30px' }}>Politika e Privatësisë</h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>Përditësuar më: 4 Dhjetor 2025</p>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>1. Informacioni që Mbledhim</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Biseda.ai mbledh informacionin e mëposhtëm për të ofruar shërbimet tona:
          </p>
          <ul style={{ lineHeight: '2', color: '#ccc', paddingLeft: '20px' }}>
            <li>Adresa e email-it (kur krijoni llogari)</li>
            <li>Informacioni i profilit që ju jepni</li>
            <li>Bisedat dhe mesazhet me AI coach</li>
            <li>Të dhënat e përdorimit të aplikacionit</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>2. Si e Përdorim Informacionin</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Ne e përdorim informacionin tuaj për:
          </p>
          <ul style={{ lineHeight: '2', color: '#ccc', paddingLeft: '20px' }}>
            <li>Të ofruar dhe përmirësuar shërbimet tona</li>
            <li>Të personalizuar përvojën tuaj me AI coach</li>
            <li>Të komunikuar me ju për përditësime</li>
            <li>Të siguruar sigurinë dhe të parandaluar abuzimin</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>3. Ruajtja e të Dhënave</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Të dhënat tuaja ruhen në serverë të sigurt. Bisedat me AI coach ruhen për të përmirësuar 
            përvojën tuaj dhe mund të fshihen në çdo kohë nga cilësimet e llogarisë.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>4. Ndarja e të Dhënave</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Ne NUK i shesim të dhënat tuaja personale. Mund të ndajmë informacion me:
          </p>
          <ul style={{ lineHeight: '2', color: '#ccc', paddingLeft: '20px' }}>
            <li>Ofruesit e shërbimeve (si OpenAI për AI chat)</li>
            <li>Kur kërkohet me ligj</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>5. Të Drejtat Tuaja</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Ju keni të drejtë të:
          </p>
          <ul style={{ lineHeight: '2', color: '#ccc', paddingLeft: '20px' }}>
            <li>Aksesoni të dhënat tuaja</li>
            <li>Korrigjoni informacionin e pasaktë</li>
            <li>Fshini llogarinë tuaj</li>
            <li>Eksportoni të dhënat tuaja</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>6. Siguria</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Ne përdorim masa të rrepta sigurie për të mbrojtur të dhënat tuaja, 
            përfshirë enkriptimin dhe autentifikimin e sigurt.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>7. Kontakti</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Për pyetje rreth privatësisë, na kontaktoni në:
            <br />
            <a href="mailto:gxhuljon@gmail.com" style={{ color: '#a855f7' }}>gxhuljon@gmail.com</a>
          </p>
        </section>

        <section style={{ marginBottom: '30px', borderTop: '1px solid #333', paddingTop: '30px' }}>
          <h1 style={{ color: '#a855f7', marginBottom: '30px' }}>Privacy Policy (English)</h1>
          
          <h2 style={{ color: '#d946ef', marginBottom: '15px' }}>1. Information We Collect</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            Biseda.ai collects the following information to provide our services:
          </p>
          <ul style={{ lineHeight: '2', color: '#ccc', paddingLeft: '20px' }}>
            <li>Email address (when you create an account)</li>
            <li>Profile information you provide</li>
            <li>Conversations with the AI coach</li>
            <li>App usage data</li>
          </ul>

          <h2 style={{ color: '#d946ef', marginBottom: '15px', marginTop: '25px' }}>2. How We Use Information</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            We use your information to provide and improve our services, personalize your AI coach experience,
            communicate updates, and ensure security.
          </p>

          <h2 style={{ color: '#d946ef', marginBottom: '15px', marginTop: '25px' }}>3. Data Sharing</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            We do NOT sell your personal data. We may share information with service providers 
            (like OpenAI for AI chat) and when required by law.
          </p>

          <h2 style={{ color: '#d946ef', marginBottom: '15px', marginTop: '25px' }}>4. Your Rights</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            You have the right to access, correct, delete, and export your data.
          </p>

          <h2 style={{ color: '#d946ef', marginBottom: '15px', marginTop: '25px' }}>5. Contact</h2>
          <p style={{ lineHeight: '1.8', color: '#ccc' }}>
            For privacy questions, contact us at: 
            <a href="mailto:gxhuljon@gmail.com" style={{ color: '#a855f7' }}> gxhuljon@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

