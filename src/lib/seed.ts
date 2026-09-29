export const DEFAULT_PROGRAM = {
  mon: {
    title: "Понедельник — грудь и трицепс",
    lead: "Тяжёлый день груди с упором на верх, брусья на объём. ≈ 65 минут.",
    warmup: "Разминка: 5–7 минут кардио, тяга каната к лицу 2×15 с лёгким весом, 2 лёгких подхода наклонного жима.",
    items: [
      {
        exerciseId: "bench-incline-barbell",
        sets: 4,
        repsLow: 6,
        repsHigh: 8,
        restSec: 150,
        startWeight: 32.5,
        supersetWith: undefined
      },
      {
        exerciseId: "hammer-incline",
        sets: 3,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "butterfly",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 75,
        startWeight: 10,
        supersetWith: undefined
      },
      {
        exerciseId: "dips-forward",
        sets: 3,
        repsLow: null,
        repsHigh: null,
        restSec: 120,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "tricep-overhead-ext",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 75,
        startWeight: 8,
        supersetWith: undefined
      },
      {
        exerciseId: "tricep-pull-down",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 10,
        supersetWith: undefined
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
        sets: null,
        repsLow: null,
        repsHigh: null,
        restSec: null,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "back-extension",
        sets: 3,
        repsLow: 15,
        repsHigh: 15,
        restSec: 60,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "row-barbell-underhand",
        sets: 4,
        repsLow: 6,
        repsHigh: 8,
        restSec: 150,
        startWeight: 40,
        supersetWith: undefined
      },
      {
        exerciseId: "pulldown-narrow",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 90,
        startWeight: 35,
        supersetWith: undefined
      },
      {
        exerciseId: "row-seated",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 90,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "pullover",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 20,
        supersetWith: undefined
      },
      {
        exerciseId: "ez-curl",
        sets: 3,
        repsLow: 8,
        repsHigh: 10,
        restSec: 90,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "hammer-curl",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 60,
        startWeight: null,
        supersetWith: undefined
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
        sets: 4,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: 10,
        supersetWith: undefined
      },
      {
        exerciseId: "crossover-low-to-high",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 75,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "db-shoulder-press",
        sets: 4,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: 10,
        supersetWith: undefined
      },
      {
        exerciseId: "crossover-one-arm",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 5,
        supersetWith: undefined
      },
      {
        exerciseId: "pull-to-chest",
        sets: 3,
        repsLow: 12,
        repsHigh: 12,
        restSec: 75,
        startWeight: 20,
        supersetWith: undefined
      },
      {
        exerciseId: "reverse-fly",
        sets: 3,
        repsLow: 15,
        repsHigh: 20,
        restSec: 60,
        startWeight: 7.5,
        supersetWith: undefined
      },
      {
        exerciseId: "pullup-max",
        sets: 3,
        repsLow: null,
        repsHigh: null,
        restSec: null,
        startWeight: null,
        supersetWith: undefined
      }
    ]
  }
};
