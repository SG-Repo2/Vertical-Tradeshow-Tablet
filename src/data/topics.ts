export type PumpMediaType = "image" | "video";

export type PumpTopic = {
  id: string;
  title: string;
  navLabel: string;
  media: {
    type: PumpMediaType;
    source: number;
    alt: string;
  };
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
  summary: string;
  whyItMatters: string;
  fieldCheck: string;
};

export const pumpCrossSection = require("../../assets/vertical/VS1_CrossSection_Transparent.png");

export const pumpTopics: PumpTopic[] = [
  {
    id: "pump-motor-alignment",
    title: "Pump/Motor Alignment",
    navLabel: "Alignment",
    media: {
      type: "video",
      source: require("../../assets/vertical/A_PumpMotorALignment.mp4"),
      alt: "Pump motor alignment video showing motor, shaft, and pump column relationship.",
    },
    hotspot: {
      x: 50,
      y: 12,
      label: "Motor and shaft alignment",
    },
    summary:
      "Motor, coupling, shaft, and pump column alignment set the baseline for the entire rotating assembly. Small offsets at the driver can amplify vibration, coupling load, and bearing wear through the column.",
    whyItMatters:
      "Reliable alignment reduces vibration energy before it is carried into the lineshaft, bearings, and bowl assembly.",
    fieldCheck:
      "Verify soft foot, coupling runout, motor register fit, and shaft concentricity before final coupling assembly.",
  },
  {
    id: "packing-best-practice",
    title: "Packing Best Practice",
    navLabel: "Packing",
    media: {
      type: "image",
      source: require("../../assets/vertical/B_PackingBestPractice.jpg"),
      alt: "Packing best practice diagram showing correct and incorrect orientation.",
    },
    hotspot: {
      x: 47,
      y: 23,
      label: "Packing gland area",
    },
    summary:
      "Packing must be installed in the correct orientation with staggered joints and a controlled leakage path. The goal is sealing with lubrication, not a dry, overheated stuffing box.",
    whyItMatters:
      "Improper packing increases sleeve wear, heat, leakage instability, and maintenance frequency.",
    fieldCheck:
      "Confirm ring orientation, lantern ring position, gland adjustment, and a controlled leakage rate after startup.",
  },
  {
    id: "resonance",
    title: "Resonance",
    navLabel: "Resonance",
    media: {
      type: "image",
      source: require("../../assets/vertical/C_Resonance.jpg"),
      alt: "Resonance mode shape diagram for a long vertical pump assembly.",
    },
    hotspot: {
      x: 56,
      y: 36,
      label: "Column vibration response",
    },
    summary:
      "Long vertical assemblies can amplify vibration when a natural frequency aligns with running speed, vane pass, or another operating excitation. The resulting mode shape can accelerate bearing wear and structural fatigue.",
    whyItMatters:
      "Separating operating excitation from structural natural frequencies keeps vibration from becoming self-reinforcing.",
    fieldCheck:
      "Review vibration data by frequency, compare against speed and vane pass, and inspect supports for looseness or changed stiffness.",
  },
  {
    id: "lineshaft-coupling",
    title: "Lineshaft Coupling",
    navLabel: "Coupling",
    media: {
      type: "image",
      source: require("../../assets/vertical/D_LineshaftCoupling.jpg"),
      alt: "Lineshaft coupling comparison including threaded, sleeve-and-keyed, and split-clamp styles.",
    },
    hotspot: {
      x: 48,
      y: 47,
      label: "Lineshaft coupling joint",
    },
    summary:
      "Threaded, sleeve-and-keyed, and split-clamp couplings each affect alignment, torque transfer, and service access differently. Coupling selection and assembly quality influence how shaft errors stack through the pump column.",
    whyItMatters:
      "A coupling that is difficult to center or service can introduce runout and make future maintenance slower.",
    fieldCheck:
      "Inspect fit, key engagement, thread condition, clamp torque, and shaft end contact per the coupling style in use.",
  },
  {
    id: "floating-spiders",
    title: "Floating Spiders",
    navLabel: "Spiders",
    media: {
      type: "image",
      source: require("../../assets/vertical/F_FloatingSpiders.jpg"),
      alt: "Floating spider diagram showing bearing support and radial movement.",
    },
    hotspot: {
      x: 53,
      y: 58,
      label: "Intermediate spider support",
    },
    summary:
      "Spiders and intermediate bearings support the lineshaft between column sections. Floating or poorly constrained components allow radial movement that reduces shaft stability.",
    whyItMatters:
      "Uncontrolled bearing support movement changes clearances and can move the shaft away from the intended centerline.",
    fieldCheck:
      "Check spider fit, register contact, bearing condition, fastener retention, and evidence of fretting or side loading.",
  },
  {
    id: "stringent-tolerances",
    title: "Stringent Tolerances",
    navLabel: "Tolerances",
    media: {
      type: "image",
      source: require("../../assets/vertical/G_StringentTolerances.jpg"),
      alt: "Tolerance diagram showing male and female registers and centerline offset.",
    },
    hotspot: {
      x: 46,
      y: 68,
      label: "Register and centerline control",
    },
    summary:
      "Male and female registers control column alignment and help keep the rotating assembly centered. For critical fits, acceptance targets such as <= 0.002\" T.I.R. help limit accumulated offset.",
    whyItMatters:
      "Tight register control prevents small fit errors from accumulating into shaft runout and uneven bearing loading.",
    fieldCheck:
      "Measure register condition, face squareness, pilot fit, and total indicated runout before accepting stacked assemblies.",
  },
  {
    id: "impeller-lock-collar",
    title: "Impeller Lock Collar",
    navLabel: "Lock Collar",
    media: {
      type: "image",
      source: require("../../assets/vertical/H_ImpellerLockCollar.jpg"),
      alt: "Impeller lock collar diagram showing pump shaft, cap screw, collar, and impeller interface.",
    },
    hotspot: {
      x: 53,
      y: 78,
      label: "Impeller retention interface",
    },
    summary:
      "The lock collar, cap screw, pump shaft, and impeller interface secure axial position inside the bowl assembly. Loosening, poor seating, or incorrect assembly can shift the impeller and change hydraulic performance.",
    whyItMatters:
      "Axial movement affects clearances, efficiency, vibration, and the risk of rubbing under load.",
    fieldCheck:
      "Confirm collar seating, cap screw condition, torque, shaft surface condition, and final impeller axial setting.",
  },
  {
    id: "submerged-suction-umbrella",
    title: "Submerged / Suction Umbrella",
    navLabel: "Submerged",
    media: {
      type: "image",
      source: require("../../assets/vertical/I_Submerged.jpg"),
      alt: "Submergence and suction umbrella diagram showing spacing and suction geometry.",
    },
    hotspot: {
      x: 50,
      y: 88,
      label: "Suction umbrella geometry",
    },
    summary:
      "Submergence, suction umbrella spacing, and inlet geometry shape the flow entering the bowl. Poor inlet conditions can create vortexing, air entrainment, and unstable hydraulic loading.",
    whyItMatters:
      "Stable suction conditions protect efficiency, vibration performance, and NPSH margin.",
    fieldCheck:
      "Verify minimum submergence, floor clearance, approach flow, and absence of surface vortices during operation.",
  },
  {
    id: "reduce-velocity",
    title: "Reduce Velocity",
    navLabel: "Velocity",
    media: {
      type: "image",
      source: require("../../assets/vertical/J_ReduceVelocity.jpg"),
      alt: "Hydraulic best practice diagram showing reduced velocity around a vertical pump intake.",
    },
    hotspot: {
      x: 57,
      y: 94,
      label: "Intake velocity control",
    },
    summary:
      "Reducing excessive intake velocity improves approach flow and lowers losses before the water reaches the impeller. Lower velocity also supports more uniform loading across the suction bell.",
    whyItMatters:
      "Controlled velocity reduces turbulence, air entrainment risk, and hydraulic instability at the pump inlet.",
    fieldCheck:
      "Review intake area, pump spacing, baffling, and flow distribution when velocity or turbulence is above design intent.",
  },
];
