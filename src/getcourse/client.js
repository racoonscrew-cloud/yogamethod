// Клиент для REST API GetCourse.
//
// Важно: API GetCourse в первую очередь предназначен для CRM-операций
// (пользователи, сделки, предложения, статусы прохождения уроков) —
// см. https://getcourse.ru/help/api. Полный текст уроков и экзаменационных
// билетов через него, как правило, не выгружается: это контент, а не CRM-объект.
// Поэтому основной способ наполнения базы знаний — вручную класть markdown-файлы
// в content/knowledge-base/ (экспорт текста уроков и билетов из админки курса).
//
// Этот клиент пригодится, когда нужно, например, проверить, что вопрос задаёт
// реальный студент потока, или подтянуть его прогресс по урокам.

const BASE_URL = (account) => `https://${account}.getcourse.ru/pl/api`;

export function createGetCourseClient({
  account = process.env.GETCOURSE_ACCOUNT,
  apiKey = process.env.GETCOURSE_API_KEY,
} = {}) {
  if (!account || !apiKey) {
    throw new Error("Не заданы GETCOURSE_ACCOUNT или GETCOURSE_API_KEY");
  }

  async function call(endpoint, params = {}) {
    const url = new URL(`${BASE_URL(account)}/${endpoint}`);
    const body = new URLSearchParams({ key: apiKey, ...params });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      throw new Error(`GetCourse API ${endpoint} вернул ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  return {
    // Уточните точные имена эндпоинтов по актуальной документации:
    // https://getcourse.ru/help/api — здесь оставлены рабочие заготовки.
    getUsers: (params) => call("account/users", params),
    getDeals: (params) => call("account/deals", params),
  };
}
