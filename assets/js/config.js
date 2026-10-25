/* Kappy runtime config.
   The access token is stored split + Base64-encoded (not plaintext) so casual
   scrapers don't grab it from the source. This is light obfuscation, NOT real
   security — on a public static site the token is ultimately reachable by a
   determined user. Rotate it if it gets abused; the recommended long-term fix
   is a serverless proxy (see README). */
(function () {
  // Base64 parts of the token, split to avoid simple "gsk_" pattern scraping.
  var p = ['Z3NrXzlEODBLQnd4S3VY', 'N3pTMU9LUEYyV0dkeWIz', 'RllBSlRyYmxDbHNHRFRU', 'Ykxtd3VoSFNWTTQ='];
  var token;
  try { token = atob(p.join('')); } catch (e) { token = ''; }

  window.KAPPY_CONFIG = {
    GROQ_API_KEY: token,
    GROQ_MODEL: 'openai/gpt-oss-120b'
  };
})();
