<template>
  <div class="player" :style="ratioStyle">
    <svg width="60" height="60" viewBox="1 10 78 58">
      <polygon :points="points"></polygon>
    </svg>
  </div>
</template>

<script>
import { TweenLite } from 'gsap/TweenLite';

function valueToPoint(value, index, total) {
  const x = 0;
  const y = -value * 0.35;

  const angle = ((Math.PI * 2) / total) * index;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const tx = x * cos - y * sin + 40;
  const ty = x * sin + y * cos + 40;

  return { x: tx, y: ty };
}

function generatePoints(stats) {
  const total = stats.length;

  return stats
    .map((stat, index) => {
      const point = valueToPoint(stat, index, total);

      return point.x + ',' + point.y;
    })
    .join(' ');
}

export default {
  name: 'player',
  props: {
    player: {
      required: true,
      type: Object,
    },
  },
  data() {
    const defaultSides = 40;
    const stats = Array.from({ length: defaultSides }, () => 100);

    return {
      stats: stats,
      points: generatePoints(stats),
      sides: defaultSides,
      minRadius: 15,
      interval: null,
      updateInterval: 300,
    };
  },
  computed: {
    ratioStyle() {
      const { player } = this;

      return {
        left: `${player.x}%`,
        top: `${player.y}%`,
      };
    },
  },
  watch: {
    sides(newSides, oldSides) {
      const sidesDifference = newSides - oldSides;

      if (sidesDifference > 0) {
        for (let i = 1; i <= sidesDifference; i++) {
          this.stats.push(this.newRandomValue());
        }
      } else {
        const absoluteSidesDifference = Math.abs(sidesDifference);

        for (let i = 1; i <= absoluteSidesDifference; i++) {
          this.stats.shift();
        }
      }
    },
    stats(newStats) {
      TweenLite.to(this.$data, this.updateInterval / 1000, {
        points: generatePoints(newStats),
      });
    },
    updateInterval() {
      this.resetInterval();
    },
  },
  mounted() {
    this.resetInterval();
  },
  methods: {
    randomizeStats() {
      this.stats = this.stats.map(() => this.newRandomValue());
    },
    newRandomValue() {
      return Math.ceil(this.minRadius + Math.random() * (100 - this.minRadius));
    },
    resetInterval() {
      clearInterval(this.interval);
      this.randomizeStats();

      this.interval = setInterval(() => {
        this.randomizeStats();
      }, this.updateInterval);
    },
  },
};
</script>

<style scoped=true>
svg {
  border-radius: 45px;
  background-color: lightcoral;
  display: inline-block;
}

polygon {
  fill: cyan;
  stroke: black;
}
</style>
