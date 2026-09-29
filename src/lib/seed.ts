export const DEFAULT_PROGRAM = {
  mon: {
    title: "Понедельник — грудь и трицепс",
    lead: "Тяжёлый день груди с упором на верх, брусья на объём. ≈ 65 минут.",
    warmup: "Разминка: 5–7 минут кардио, тяга каната к лицу 2×15 с лёгким весом, 2 лёгких подхода наклонного жима.",
    items: [
      {
        exerciseId: "bench-incline-barbell",
        name: "Жим штанги на наклонной скамье 30°",
        sets: 4,
        repsLow: 6,
        repsHigh: 8,
        restSec: 150,
        startWeight: 32.5,
        was: "45",
        tip: "Главное упражнение недели на верх груди. Угол 30°, не выше — иначе работают плечи. Гриф опушай под ключицы, лопатки сведены."
      },
      {
        exerciseId: "hammer-incline",
        name: "Жим в Хаммере на наклонной",
        sets: 3,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: null,
        was: "",
        tip: "Если наклонного Хаммера нет — горизонтальный. Тренажёр даёт добить грудь без страха уронить вес, можно работать ближе к отказу."
      },
      {
        exerciseId: "butterfly",
        name: "Бабочка",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 75,
        startWeight: 10,
        was: "10",
        tip: "Локти зафиксированы на уровне плеч. В конце сведения задержись на секунду и сожми грудь."
      },
      {
        exerciseId: "dips-forward",
        name: "Брусья, корпус вперёд — объём",
        sets: 3,
        repsLow: null,
        repsHigh: null,
        restSec: 120,
        startWeight: null,
        was: "",
        tip: "Наклон вперёд переводит нагрузку на грудь. Стоп за 2 повтора до отказа. Плечо опускай до уровня локтя, ниже не надо."
      },
      {
        exerciseId: "tricep-overhead-ext",
        name: "Разгибание гантели из-за головы",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 75,
        startWeight: 8,
        was: "12",
        tip: "Длинная головка трицепса. Локоть смотрит вверх и не разъезжается, вниз опускай медленно, вверху выпрямляй руку полностью."
      },
      {
        exerciseId: "tricep-pull-down",
        name: "Разгибания на канате стоя",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 10,
        was: "15",
        tip: "Корпус вертикально, локти прижаты к бокам — работает боковая головка, а не та же длинная, что в прошлом упражнении. Внизу разводи канат и держи секунду."
      }
    ]
  },
  wed: {
    title: "Среда — спина и бицепс",
    lead: "Вся спина: ширина, толщина, низ. Турник лестницей. ≈ 75 минут.",
    warmup: "Разминка: 5–7 минут кардио, вращения плечами, 2 лёгких подхода тяги.",
    items: [
      {
        exerciseId: "pullup-ladder",
        name: "Подтягивания — лестница",
        sets: null,
        repsLow: null,
        repsHigh: null,
        restSec: null,
        startWeight: null,
        was: "",
        tip: "Между ступенями отдыхай примерно 10 секунд за каждый сделанный повтор. Нед 1–2: 2 лестницы до 4. Нед 3–7: 3 лестницы, верхняя ступень +1 каждые 2 недели."
      },
      {
        exerciseId: "back-extension",
        name: "Гиперэкстензия",
        sets: 3,
        repsLow: 15,
        repsHigh: 15,
        restSec: 60,
        startWeight: null,
        was: "",
        tip: "Низ спины. Поднимаешься до прямой линии корпуса, выше не надо. Когда 15 идут легко — блин 5–10 кг на грудь."
      },
      {
        exerciseId: "row-barbell-underhand",
        name: "Тяга штанги в наклоне обратным хватом",
        sets: 4,
        repsLow: 6,
        repsHigh: 8,
        restSec: 150,
        startWeight: 40,
        was: "50–55",
        tip: "Толщина спины. Наклон около 45°, тянешь к поясу, локти вдоль корпуса. Спина округлилась — сбрасывай вес."
      },
      {
        exerciseId: "pulldown-narrow",
        name: "Вертикальный блок узким хватом",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 90,
        startWeight: 35,
        was: "50",
        tip: "Хват узкий или нейтральный — широким ты уже подтягивался в начале, незачем дублировать вектор. Тянешь к верху груди, локти идут вниз."
      },
      {
        exerciseId: "row-seated",
        name: "Горизонтальная тяга",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 90,
        startWeight: null,
        was: "55",
        tip: "Середина спины. Грудь вперёд, в конце своди лопатки и держи секунду. Корпусом не раскачивайся."
      },
      {
        exerciseId: "pullover",
        name: "Пуловер на верхнем блоке",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 20,
        was: "30",
        tip: "Руки почти прямые, ведёшь канат к бёдрам широчайшими. Даёт ширину спины."
      },
      {
        exerciseId: "ez-curl",
        name: "Подъём EZ-штанги стоя",
        sets: 3,
        repsLow: 8,
        repsHigh: 10,
        restSec: 90,
        startWeight: null,
        was: "15",
        tip: "Локти не уходят вперёд, корпус не качается. Опускай 2–3 секунды."
      },
      {
        exerciseId: "hammer-curl",
        name: "Молотки",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 60,
        startWeight: null,
        was: "12",
        tip: "Поочерёдно, без раскачки. Качают брахиалис — рука становится толще."
      }
    ]
  },
  fri: {
    title: "Пятница — добавка груди и плечи",
    lead: "Лёгкий по весам, объёмный день. Средняя и задняя дельта, турник на максимум. ≈ 70 минут.",
    warmup: "Разминка: 5–7 минут кардио, тяга каната к лицу 2×15, 2 лёгких подхода наклонного жима гантелей.",
    items: [
      {
        exerciseId: "db-incline",
        name: "Жим гантелей на наклонной скамье 30°",
        sets: 4,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: 10,
        was: "12",
        tip: "Второй заход на верх груди за неделю, но в другом диапазоне. Внизу гантели у груди, локти под 45° к корпусу."
      },
      {
        exerciseId: "crossover-low-to-high",
        name: "Сведение в кроссовере снизу вверх",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 75,
        startWeight: null,
        was: "",
        tip: "Тросы снизу, руки идут вверх к подбородку. Чистая добивка верха груди — вес вторичен, чувствуй мышцу."
      },
      {
        exerciseId: "db-shoulder-press",
        name: "Жим гантелей сидя",
        sets: 4,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: 10,
        was: "12–16",
        tip: "Без вертикального жима дельты массу не наберут, махи этого не заменят. Спинка почти вертикально, опушай до уровня ушей."
      },
      {
        exerciseId: "crossover-one-arm",
        name: "Махи в кроссовере по одной руке",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 5,
        was: "7",
        tip: "Средняя дельта. Трос из нижнего блока за спиной, ведёшь локтем. Раскачиваешься — вес большой."
      },
      {
        exerciseId: "pull-to-chest",
        name: "Протяжка штанги к груди",
        sets: 3,
        repsLow: 12,
        repsHigh: 12,
        restSec: 75,
        startWeight: 20,
        was: "",
        tip: "Хват только широкий, выше уровня груди не тянешь — узкий хват и высокая протяжка выкручивают плечо. Локти всегда выше кистей."
      },
      {
        exerciseId: "reverse-fly",
        name: "Обратная бабочка",
        sets: 3,
        repsLow: 15,
        repsHigh: 20,
        restSec: 60,
        startWeight: 7.5,
        was: "10",
        tip: "Задняя дельта. Рукояти на уровне плеч, руки слегка согнуты, много повторов и чистая техника."
      },
      {
        exerciseId: "pullup-max",
        name: "Подтягивания на максимум",
        sets: 3,
        repsLow: null,
        repsHigh: null,
        restSec: null,
        startWeight: null,
        was: "",
        tip: "Широкий, нейтральный, обратный хват — по подходу. Каждый до последнего чистого повтора. Записывай числа, это твой прогресс."
      }
    ]
  }
};
