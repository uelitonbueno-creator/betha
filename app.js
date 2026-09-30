(() => {
  const params = new URLSearchParams(window.location.search);
  const query = {};
  for (const [key, value] of params.entries()) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      query[key] = Array.isArray(query[key]) ? [...query[key], value] : [query[key], value];
    } else {
      query[key] = value;
    }
  }

  const payload = {
    url: window.location.href,
    origem: document.referrer || "(sem referrer)",
    parametros: query,
    dataHoraLocal: new Date().toLocaleString("pt-BR")
  };

  const contextEl = document.getElementById("context");
  contextEl.textContent = JSON.stringify(payload, null, 2);

  document.getElementById("copyBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(contextEl.textContent);
      document.getElementById("copyBtn").textContent = "Copiado";
      setTimeout(() => document.getElementById("copyBtn").textContent = "Copiar contexto", 1500);
    } catch {
      document.getElementById("copyBtn").textContent = "Selecione e copie";
    }
  });

  const result = document.getElementById("moduleResult");
  document.querySelectorAll("[data-module]").forEach(btn => {
    btn.addEventListener("click", () => {
      result.textContent = "Módulo " + btn.dataset.module + " selecionado. A próxima etapa é ligar este módulo à API Betha correspondente.";
    });
  });
})();