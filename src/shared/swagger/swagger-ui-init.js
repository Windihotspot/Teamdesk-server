// swagger-ui-init.js
window.onload = function () {
  SwaggerUIBundle({
    url: "/api/docs.json",
    dom_id: "#swagger-ui",
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout",
    persistAuthorization: true,
  });
};
