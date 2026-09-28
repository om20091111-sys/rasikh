const MODEL = "@cf/zai-org/glm-4.7-flash";

const LANGUAGE_NAMES = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  tr: "Türkçe",
  ur: "اردو"
};

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        {
          status: 405,
          headers: corsHeaders
        }
      );
    }

    try {
      const body = await request.json();

      const question = String(body.question || "").trim();
      const language = body.language || "ar";

      if (!question) {
        return Response.json(
          { error: "السؤال مطلوب" },
          {
            status: 400,
            headers: corsHeaders
          }
        );
      }

      const languageName =
        LANGUAGE_NAMES[language] || LANGUAGE_NAMES.ar;

      const systemPrompt = `
أنت "راسخ"، منصة للمعرفة الإسلامية الموثقة.

مهمتك في هذه المرحلة هي اختبار الاتصال بالنموذج فقط.
لا تدّعِ أن لديك قاعدة مصادر أو مراجع لم يتم تزويدك بها.

قواعد أساسية:
1. أجب بلغة المستخدم المطلوبة: ${languageName}.
2. لا تخترع مصادر أو كتبًا أو صفحات.
3. لا تنسب قولًا إلى عالم أو كتاب بدون دليل.
4. إذا لم تكن لديك مصادر كافية، صرّح بوضوح أن المعلومات غير كافية.
5. في مسائل الفتوى والحالات الشخصية، لا تقدم نفسك كمفتٍ، ووجّه المستخدم إلى عالم مؤهل عند الحاجة.
6. كن واضحًا ومختصرًا.
`;

      const result = await env.AI.run(MODEL, {
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: question
          }
        ]
      });

      return Response.json(
        {
          success: true,
          answer: result.response || "",
          language
        },
        {
          headers: corsHeaders
        }
      );

    } catch (error) {
      return Response.json(
        {
          success: false,
          error: "حدث خطأ أثناء معالجة السؤال."
        },
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }
  }
};
