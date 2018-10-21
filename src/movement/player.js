const horizontalVelocity = 0.9;
const verticalVelocity = 0.9;

function keyFuncMap(me) {
  return {
    37: () => {
      me.x -= horizontalVelocity;
    },
    38: () => {
      me.y -= verticalVelocity;
    },
    39: () => {
      me.x += horizontalVelocity;
    },
    40: () => {
      me.y += verticalVelocity;
    },
  };
}

export function keyFuncs(me, code) {
  const result = keyFuncMap(me)[code];

  if (!result) {
    return null;
  }

  result();

  return null;
}
