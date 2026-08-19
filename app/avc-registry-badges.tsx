export function AvcRegistryBadges() {
  return (
    <>
      <details className="avc-header">
        <summary>
          <span className="avc-dot">✓</span>
          <span>
            <b>AVC Kayıtlı</b>
            <small>Dijital ekosistem kimliği</small>
          </span>
        </summary>
          <div className="avc-panel">
            <b className="avc-panel-title">AVC Dijital Ekosistem Kaydı</b>
          <p>
            <strong>Avcı E-Ticaret</strong>, ortak marka ve üretim standartlarıyla AVC ağı içinde
            yayınlanır.
          </p>
          <a href="https://hub.avcieticaret.com" target="_blank" rel="noreferrer">
            Sahiplik kaydını doğrula
          </a>
        </div>
      </details>

      <details className="avc-side">
        <summary>
          <span className="ok">✓</span>
          <span className="txt">AVC Kayıtlı</span>
        </summary>
          <div className="panel">
            <div className="avc-side-copy">
              <b>AVC sahiplik kaydı</b>
            <p>
              Avcı E-Ticaret sitesinin tasarımı, yazılımı ve marka görünümü Mahir Avcı / Avcı
              E-Ticaret’e aittir. İzinsiz kopya hukuka aykırıdır.
            </p>
          </div>
          <a href="https://hub.avcieticaret.com" target="_blank" rel="noreferrer">
            Kaydı doğrula
          </a>
        </div>
      </details>
    </>
  );
}
