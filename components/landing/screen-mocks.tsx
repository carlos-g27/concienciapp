import styles from "./landing-page.module.css";

/**
 * Maquetas decorativas (mini-UI en CSS) para las tarjetas de la galería de la
 * landing. No son gráficas de datos reales; solo representan cada pantalla de
 * la app con los tokens de marca. Presentacionales (sin estado ni props).
 */

export function HomeMock() {
  return (
    <div className={styles.mock}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Progreso</span>
        <span className={styles.mockDot} />
      </div>
      <div className={styles.mockStats}>
        <div className={styles.mockStat}>
          <span className={styles.mockStatNum}>3</span>
          <span className={styles.mockLine} style={{ width: "70%" }} />
        </div>
        <div className={styles.mockStat}>
          <span className={styles.mockStatNum}>5</span>
          <span className={styles.mockLine} style={{ width: "70%" }} />
        </div>
        <div className={styles.mockStat}>
          <span className={styles.mockStatNum}>80%</span>
          <span className={styles.mockLine} style={{ width: "70%" }} />
        </div>
      </div>
      <div className={styles.mockRow}>
        <span className={styles.mockIcon} />
        <span className={styles.mockRowText}>
          <span className={`${styles.mockLine} ${styles.mockLineStrong}`} style={{ width: "60%" }} />
          <span className={styles.mockLine} style={{ width: "90%" }} />
        </span>
      </div>
      <div className={styles.mockRow}>
        <span className={styles.mockIcon} />
        <span className={styles.mockRowText}>
          <span className={`${styles.mockLine} ${styles.mockLineStrong}`} style={{ width: "50%" }} />
          <span className={styles.mockLine} style={{ width: "80%" }} />
        </span>
      </div>
    </div>
  );
}

export function NutricionMock() {
  const meals = ["320 kcal", "540 kcal", "610 kcal"];
  return (
    <div className={styles.mock}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Nutrición</span>
        <span className={styles.mockDot} />
      </div>
      {meals.map((kcal, i) => (
        <div className={styles.mockRow} key={i}>
          <span className={styles.mockIcon} />
          <span className={styles.mockRowText}>
            <span className={`${styles.mockLine} ${styles.mockLineStrong}`} style={{ width: "55%" }} />
            <span className={styles.mockLine} style={{ width: "85%" }} />
          </span>
          <span className={styles.mockTag}>{kcal}</span>
        </div>
      ))}
    </div>
  );
}

export function EntrenamientoMock() {
  const sets = ["3×12", "4×10", "3×15"];
  return (
    <div className={styles.mock}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Rutina de hoy</span>
        <span className={styles.mockDot} />
      </div>
      {sets.map((rep, i) => (
        <div className={styles.mockRow} key={i}>
          <span className={styles.mockIcon} />
          <span className={styles.mockRowText}>
            <span className={`${styles.mockLine} ${styles.mockLineStrong}`} style={{ width: "60%" }} />
            <span className={styles.mockLine} style={{ width: "40%" }} />
          </span>
          <span className={styles.mockTag}>{rep}</span>
        </div>
      ))}
    </div>
  );
}

export function MentalMock() {
  const times = ["5 min", "10 min"];
  return (
    <div className={styles.mock}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Meditaciones</span>
        <span className={styles.mockDot} />
      </div>
      {times.map((t, i) => (
        <div className={styles.mockRow} key={i} style={{ padding: "12px 10px" }}>
          <span className={styles.mockIcon} style={{ width: 34, height: 34, borderRadius: "50%" }} />
          <span className={styles.mockRowText}>
            <span className={`${styles.mockLine} ${styles.mockLineStrong}`} style={{ width: "65%" }} />
            <span className={styles.mockLine} style={{ width: "45%" }} />
          </span>
          <span className={styles.mockTag}>{t}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgresoMock() {
  const heights = [40, 55, 48, 70, 62, 88];
  return (
    <div className={styles.mock}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Progreso de RM</span>
        <span className={styles.mockDot} />
      </div>
      <div className={styles.mockBars}>
        {heights.map((h, i) => (
          <span className={styles.mockBar} key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function PerfilMock() {
  return (
    <div className={styles.mock}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Victorias de hoy</span>
        <span className={styles.mockDot} />
      </div>
      <div className={styles.mockRing}>
        <span className={styles.mockRingInner}>72%</span>
      </div>
      <div className={styles.mockRow}>
        <span className={styles.mockCheck} />
        <span className={styles.mockLine} style={{ width: "60%" }} />
      </div>
      <div className={styles.mockRow}>
        <span className={styles.mockCheck} />
        <span className={styles.mockLine} style={{ width: "45%" }} />
      </div>
    </div>
  );
}

export const SCREEN_MOCKS: Record<string, React.ComponentType> = {
  home: HomeMock,
  nutricion: NutricionMock,
  entrenamiento: EntrenamientoMock,
  mental: MentalMock,
  progreso: ProgresoMock,
  perfil: PerfilMock,
};
