/**
 * Watchdog de NÃO-EXECUÇÃO (healthchecks.io) — Task 3.11
 *
 * Porquê isto existe:
 * O GitHub desativa cada workflow agendado individualmente, no seu próprio
 * disparo seguinte, após 60 dias sem atividade no repo. A última execução
 * antes do silêncio é SEMPRE verde — nenhuma validação de resposta deteta
 * isso. Foi assim que a mesada de agosto e 5 meses de juros falharam sem
 * ninguém dar por nada. O Vercel Cron não expira, mas também não tem retry
 * nem alerta; quem deteta o silêncio é este ping externo.
 *
 * Cada cron faz ping num check do healthchecks.io (Period 1 dia / Grace 12h).
 * Se o ping não chegar dentro da janela, o healthchecks manda email.
 * É o único mecanismo que deteta "o cron não correu" — por oposição a
 * "o cron correu e falhou", que a resposta HTTP já cobre.
 */

/** O healthchecks.io guarda até 100KB de corpo por ping. */
const MAX_BODY_BYTES = 100_000;
const TIMEOUT_MS = 5_000;

export async function pingHealthcheck(
  baseUrl: string | undefined,
  opts?: { fail?: boolean; body?: unknown }
): Promise<void> {
  // Sem URL configurado (local, preview) não há watchdog — e isso não é erro.
  if (!baseUrl) {
    return;
  }

  // Tudo daqui para baixo é best-effort: se o watchdog falhar, isso NUNCA
  // pode partir o cron que ele monitoriza. Falha silenciosa é aceitável
  // AQUI e só aqui.
  try {
    const url = opts?.fail
      ? `${baseUrl.replace(/\/+$/, '')}/fail`
      : baseUrl.replace(/\/+$/, '');

    // O corpo aparece no email de alerta — é o que dá contexto ao aviso.
    let body = JSON.stringify(opts?.body ?? {});
    if (body.length > MAX_BODY_BYTES) {
      body = body.slice(0, MAX_BODY_BYTES - 20) + '…[truncado]"}';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    // Deliberadamente engolido — ver comentário acima.
    console.error('Ping do healthcheck falhou (ignorado):', error);
  }
}
