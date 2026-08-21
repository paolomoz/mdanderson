// Loads doctorpodcasting's easyXDM bootstrap, then builds the radiomd
// player iframe exactly as live does (radiomd_embedded("texacc", ...)).
// strict-dynamic CSP: this module is nonce-trusted, so the script it
// creates inherits trust.
export default function init() {
  const s = document.createElement('script');
  s.src = 'https://support.doctorpodcasting.com/widget/easyXDM.js';
  s.onload = () => {
    if (typeof window.radiomd_embedded === 'function') {
      window.radiomd_embedded('texacc', 'radiomd-embedded');
    }
  };
  document.head.append(s);
}
