import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  LAB_EQUIPMENT_3D_ITEMS,
  HOSPITAL_NPCS,
  LabEquipmentItem,
  NpcCharacterData,
} from '../data/clinicalSimulationData';
import { soundManager } from '../utils/soundManager';
import {
  Compass,
  Microscope,
  MessageSquare,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Play,
  X,
  UserCheck,
  Navigation,
} from 'lucide-react';

interface Hospital3DWorldProps {
  studentName: string;
  studentNpm: string;
  avatarGender: 'male_atlm' | 'female_atlm';
  labCoatColor?: string;
  scrubColor?: string;
  hairColor?: string;
  skinTone?: string;
  onStartQuiz?: () => void;
  onOpenCalculator?: () => void;
  onOpenSimulation?: () => void;
}

function buildRobloxCharacter(options: {
  coatColor: string;
  scrubColor: string;
  hairColor: string;
  skinTone: string;
  isFemale: boolean;
  isAtlmBadge?: boolean;
}): THREE.Group {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: options.skinTone || '#f1c27d',
    roughness: 0.45,
  });
  const scrubMat = new THREE.MeshStandardMaterial({
    color: options.scrubColor || '#0284c7',
    roughness: 0.5,
  });
  const coatMat = new THREE.MeshStandardMaterial({
    color: options.coatColor || '#ffffff',
    roughness: 0.35,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: options.hairColor || '#1e293b',
    roughness: 0.6,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.4,
  });

  // 1 & 2: Left & Right Legs (Scrub pants + shoes)
  const legGeo = new THREE.BoxGeometry(0.32, 0.75, 0.32);
  const leftLeg = new THREE.Mesh(legGeo, scrubMat);
  leftLeg.position.set(-0.2, 0.42, 0);
  leftLeg.name = 'leftLeg';
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, scrubMat);
  rightLeg.position.set(0.2, 0.42, 0);
  rightLeg.name = 'rightLeg';
  group.add(rightLeg);

  const shoeGeo = new THREE.BoxGeometry(0.34, 0.14, 0.42);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(-0.2, 0.07, 0.04);
  group.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0.2, 0.07, 0.04);
  group.add(rightShoe);

  // 3: Torso (Inner scrub + outer medical lab coat)
  const torsoGeo = new THREE.BoxGeometry(0.76, 0.92, 0.42);
  const torso = new THREE.Mesh(torsoGeo, coatMat);
  torso.position.set(0, 1.24, 0);
  group.add(torso);

  const scrubShirtGeo = new THREE.BoxGeometry(0.34, 0.88, 0.44);
  const scrubFront = new THREE.Mesh(scrubShirtGeo, scrubMat);
  scrubFront.position.set(0, 1.25, 0.01);
  group.add(scrubFront);

  // 4: ID Badge on Chest (ATLM / Medical ID)
  if (options.isAtlmBadge !== false) {
    const badgeGeo = new THREE.BoxGeometry(0.18, 0.24, 0.04);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      metalness: 0.3,
      roughness: 0.2,
    });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0.22, 1.42, 0.23);
    group.add(badge);
  }

  // 5 & 6: Left & Right Arms
  const armGeo = new THREE.BoxGeometry(0.26, 0.78, 0.26);
  const leftArm = new THREE.Mesh(armGeo, coatMat);
  leftArm.position.set(-0.54, 1.24, 0);
  leftArm.name = 'leftArm';
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, coatMat);
  rightArm.position.set(0.54, 1.24, 0);
  rightArm.name = 'rightArm';
  group.add(rightArm);

  // Hands
  const handGeo = new THREE.SphereGeometry(0.13, 12, 12);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(-0.54, 0.8, 0);
  group.add(leftHand);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0.54, 0.8, 0);
  group.add(rightHand);

  // 7: Head (Rounded Roblox style)
  const headGeo = new THREE.BoxGeometry(0.58, 0.58, 0.58);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 2.02, 0);
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.13, 2.05, 0.29);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.13, 2.05, 0.29);
  group.add(rightEye);

  // 8: Hair (Male vs Female styling)
  const topHairGeo = new THREE.BoxGeometry(0.64, 0.22, 0.64);
  const topHair = new THREE.Mesh(topHairGeo, hairMat);
  topHair.position.set(0, 2.28, 0);
  group.add(topHair);

  if (options.isFemale) {
    const backHairGeo = new THREE.BoxGeometry(0.62, 0.68, 0.22);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.set(0, 1.92, -0.26);
    group.add(backHair);
  }

  return group;
}

function buildLabInstrumentGroup(item: LabEquipmentItem): THREE.Group {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.35,
    metalness: 0.2,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: item.color,
    roughness: 0.25,
    metalness: 0.4,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.4,
  });
  const screenMat = new THREE.MeshStandardMaterial({
    color: '#0284c7',
    emissive: item.color,
    emissiveIntensity: 0.35,
    roughness: 0.2,
  });

  // 1: Lab Bench / Table Base
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 1.4), baseMat);
  tableTop.position.set(0, 0.9, 0);
  group.add(tableTop);

  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 10);
  const legPositions: [number, number][] = [
    [-1.05, -0.55],
    [1.05, -0.55],
    [-1.05, 0.55],
    [1.05, 0.55],
  ];
  legPositions.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, darkMat);
    leg.position.set(lx, 0.45, lz);
    group.add(leg);
  });

  // 2: Specialized Instrument Geometry on top of table
  if (item.id === 'hematology_analyzer') {
    const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.95, 0.9), baseMat);
    mainChassis.position.set(-0.3, 1.44, 0);
    group.add(mainChassis);

    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.94), accentMat);
    frontPanel.position.set(-0.55, 1.44, 0.02);
    group.add(frontPanel);

    const sampleProbe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12), darkMat);
    sampleProbe.position.set(0.15, 1.25, 0.38);
    group.add(sampleProbe);

    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 0.08), screenMat);
    monitor.position.set(0.65, 1.45, 0.1);
    group.add(monitor);
  } else if (item.id === 'digital_microscope') {
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.65), darkMat);
    mBase.position.set(0, 1.03, 0);
    group.add(mBase);

    const mArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.68, 0.22), baseMat);
    mArm.position.set(0, 1.38, -0.2);
    group.add(mArm);

    const stage = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), darkMat);
    stage.position.set(0, 1.32, 0.05);
    group.add(stage);

    const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 12), accentMat);
    eyepiece.rotation.x = Math.PI / 5;
    eyepiece.position.set(0, 1.78, 0.08);
    group.add(eyepiece);
  } else if (item.id === 'centrifuge') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.56, 20), baseMat);
    body.position.set(0, 1.25, 0);
    group.add(body);

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.08, 20), accentMat);
    lid.position.set(0, 1.56, 0);
    group.add(lid);
  } else if (item.id === 'blood_refrigerator' || item.id === 'reagent_cabinet') {
    const tallBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 1.1), baseMat);
    tallBox.position.set(0, 1.1, 0);
    group.add(tallBox);

    const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.85, 0.08), screenMat);
    glassDoor.position.set(0, 1.15, 0.54);
    group.add(glassDoor);
  } else {
    const unit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 0.75), accentMat);
    unit.position.set(0, 1.3, 0);
    group.add(unit);

    const display = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.08), screenMat);
    display.position.set(0, 1.42, 0.36);
    group.add(display);
  }

  // Floating glowing beacon ring above station
  const ringGeo = new THREE.TorusGeometry(0.45, 0.035, 10, 28);
  const ringMat = new THREE.MeshBasicMaterial({ color: item.color });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 2.55, 0);
  ring.name = 'beaconRing';
  group.add(ring);

  return group;
}

function buildPatientStationGroup(stationType: 'bed' | 'chair', accentColor: string): THREE.Group {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    metalness: 0.4,
    roughness: 0.35,
  });
  const mattressMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.45,
  });
  const blanketMat = new THREE.MeshStandardMaterial({
    color: accentColor || '#0284c7',
    roughness: 0.5,
  });
  const ivPoleMat = new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    metalness: 0.6,
    roughness: 0.25,
  });
  const ivBagMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.85,
  });

  if (stationType === 'bed') {
    // Hospital Bed Frame & Mattress positioned behind/next to the patient avatar
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 2.3), frameMat);
    bedFrame.position.set(0, 0.25, -0.75);
    group.add(bedFrame);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 2.15), mattressMat);
    mattress.position.set(0, 0.56, -0.75);
    group.add(mattress);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.24, 1.35), blanketMat);
    blanket.position.set(0, 0.58, -0.45);
    group.add(blanket);

    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.45), mattressMat);
    pillow.position.set(0, 0.72, -1.5);
    group.add(pillow);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.52, 1.15, 0.14), frameMat);
    headboard.position.set(0, 0.7, -1.88);
    group.add(headboard);

    // IV Drip Stand (Tiang Infus) & Fluid Bag
    const ivBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 12), ivPoleMat);
    ivBase.position.set(1.05, 0.04, -1.2);
    group.add(ivBase);

    const ivPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 10), ivPoleMat);
    ivPole.position.set(1.05, 1.1, -1.2);
    group.add(ivPole);

    const ivBag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.1), ivBagMat);
    ivBag.position.set(1.05, 1.95, -1.12);
    group.add(ivBag);
  } else {
    // Clinical Phlebotomy Chair (Kursi Pengambilan Sampel Darah Vena)
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 1.0), blanketMat);
    seat.position.set(0, 0.52, -0.45);
    group.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.05, 0.16), blanketMat);
    backrest.position.set(0, 1.05, -0.92);
    group.add(backrest);

    const leftArmrest = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.85), frameMat);
    leftArmrest.position.set(-0.6, 0.78, -0.42);
    group.add(leftArmrest);

    const rightArmrest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.92), frameMat);
    rightArmrest.position.set(0.62, 0.78, -0.38);
    group.add(rightArmrest);
  }

  // Patient Beacon Ring above patient
  const patientRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.04, 10, 28),
    new THREE.MeshBasicMaterial({ color: '#f59e0b' })
  );
  patientRing.rotation.x = Math.PI / 2;
  patientRing.position.set(0, 2.65, 0);
  group.add(patientRing);

  return group;
}

function build3DBloodCell(type: 'rbc' | 'wbc' | 'plt'): THREE.Group {
  const group = new THREE.Group();
  if (type === 'rbc') {
    // Biconcave disc using torus + flattened center sphere
    const rbcMat = new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.35,
      metalness: 0.1,
    });
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.14, 14, 28), rbcMat);
    outerRing.rotation.x = Math.PI / 2;
    group.add(outerRing);

    const centerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.09, 20), rbcMat);
    group.add(centerDisc);
  } else if (type === 'wbc') {
    const wbcMat = new THREE.MeshStandardMaterial({
      color: '#eff6ff',
      roughness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: '#4f46e5',
      roughness: 0.3,
    });
    const cellBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 18), wbcMat);
    group.add(cellBody);

    // Multi-lobed nucleus inside
    const lobe1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), nucleusMat);
    lobe1.position.set(-0.12, 0.06, 0);
    group.add(lobe1);

    const lobe2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), nucleusMat);
    lobe2.position.set(0.14, -0.05, 0.08);
    group.add(lobe2);
  } else {
    const pltMat = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.3,
    });
    const plt = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 1), pltMat);
    plt.scale.set(1.2, 0.5, 1.2);
    group.add(plt);
  }
  return group;
}

export const Hospital3DWorld: React.FC<Hospital3DWorldProps> = ({
  studentName,
  studentNpm,
  avatarGender,
  labCoatColor = '#ffffff',
  scrubColor = '#0284c7',
  hairColor = '#1e293b',
  skinTone = '#f1c27d',
  onStartQuiz,
  onOpenCalculator,
  onOpenSimulation,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipmentItem | null>(null);
  const [activeNpc, setActiveNpc] = useState<NpcCharacterData | null>(null);
  const [npcDialogueIndex, setNpcDialogueIndex] = useState(0);
  const [dialogueLang, setDialogueLang] = useState<'id' | 'en'>('id');
  const [nearbyTarget, setNearbyTarget] = useState<{
    type: 'equipment' | 'npc';
    label: string;
    data: LabEquipmentItem | NpcCharacterData;
  } | null>(null);
  const [currentZone, setCurrentZone] = useState<string>('Lobby Utama & Profil Klinis IKES Rajawali');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  // Refs for movement state so keyboard/mobile joystick update seamlessly
  const keysRef = useRef<Record<string, boolean>>({});
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 8));
  const playerYawRef = useRef<number>(Math.PI);
  const cameraYawRef = useRef<number>(0);
  const jumpVelocityRef = useRef<number>(0);
  const isJumpingRef = useRef<boolean>(false);
  const nearbyTargetRef = useRef<typeof nearbyTarget>(null);

  const teleportToZone = (x: number, z: number, zoneTitle: string) => {
    soundManager.playDoor();
    playerPosRef.current.set(x, 0, z);
    setCurrentZone(zoneTitle);
  };

  const triggerInteract = () => {
    const target = nearbyTargetRef.current;
    if (!target) return;
    if (target.type === 'equipment') {
      soundManager.playClick();
      setSelectedEquipment(target.data as LabEquipmentItem);
      setActiveNpc(null);
    } else {
      soundManager.playNpcInteract();
      const npc = target.data as NpcCharacterData;
      setActiveNpc(npc);
      setNpcDialogueIndex(0);
      setSelectedEquipment(null);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#273e57');
    scene.fog = new THREE.FogExp2('#273e57', 0.015);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 160);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererName = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(rendererName);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Lighting
    const ambientLight = new THREE.AmbientLight('#f8fafc', 0.78);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.15);
    dirLight.position.set(12, 24, 14);
    scene.add(dirLight);

    // Hospital Floor & Zone Carpets
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#364f6b',
      roughness: 0.55,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(56, 56), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(56, 28, '#7dd3fc', '#476585');
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Futuristic Hematology Lab Zone Floor Highlight
    const labZoneFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 14),
      new THREE.MeshStandardMaterial({ color: '#1e567c', roughness: 0.35 })
    );
    labZoneFloor.rotation.x = -Math.PI / 2;
    labZoneFloor.position.set(0, 0.02, -3);
    scene.add(labZoneFloor);

    // Hospital Walls & Glass Partitions
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#243b55',
      roughness: 0.5,
    });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.4), wallMat);
    backWall.position.set(0, 3, -12);
    scene.add(backWall);

    // 10 Lab Instruments in 3D
    const equipmentMeshes: { item: LabEquipmentItem; group: THREE.Group }[] = [];
    LAB_EQUIPMENT_3D_ITEMS.forEach((eqItem) => {
      const eqGroup = buildLabInstrumentGroup(eqItem);
      eqGroup.position.set(eqItem.position[0], eqItem.position[1], eqItem.position[2]);
      scene.add(eqGroup);
      equipmentMeshes.push({ item: eqItem, group: eqGroup });
    });

    // NPCs & 6 Clinical Patients in 3D
    const npcMeshes: { npc: NpcCharacterData; group: THREE.Group; basePos: THREE.Vector3 }[] = [];
    HOSPITAL_NPCS.forEach((npc) => {
      if (npc.role === 'patient') {
        const stationMesh = buildPatientStationGroup(
          npc.patientStationType || 'bed',
          npc.scrubColor
        );
        stationMesh.position.set(npc.position[0], npc.position[1], npc.position[2]);
        scene.add(stationMesh);
      }

      const npcGroup = buildRobloxCharacter({
        coatColor: npc.coatColor,
        scrubColor: npc.scrubColor,
        hairColor: npc.hairColor,
        skinTone: '#f1c27d',
        isFemale:
          npc.id.includes('juwita') ||
          npc.id.includes('arasya') ||
          npc.id.includes('siti') ||
          npc.id.includes('nadia') ||
          npc.id.includes('dewi'),
        isAtlmBadge: npc.role !== 'patient',
      });
      npcGroup.position.set(npc.position[0], npc.position[1], npc.position[2]);
      scene.add(npcGroup);
      npcMeshes.push({
        npc,
        group: npcGroup,
        basePos: new THREE.Vector3(npc.position[0], npc.position[1], npc.position[2]),
      });
    });

    // Floating 3D Red Blood Cells, White Blood Cells & Platelets in the Hospital Atrium
    const floatingCells: { group: THREE.Group; speed: number; offset: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const cellType = i % 3 === 0 ? 'wbc' : i % 5 === 0 ? 'plt' : 'rbc';
      const cellGroup = build3DBloodCell(cellType);
      const angle = (i / 18) * Math.PI * 2;
      const radius = 9 + (i % 4) * 2.5;
      cellGroup.position.set(Math.cos(angle) * radius, 3.2 + (i % 3) * 0.8, Math.sin(angle) * radius);
      scene.add(cellGroup);
      floatingCells.push({ group: cellGroup, speed: 0.6 + (i % 4) * 0.2, offset: i });
    }

    // Playable ATLM Student Avatar (Strictly Male ATLM or Female ATLM)
    const playerAvatar = buildRobloxCharacter({
      coatColor: labCoatColor,
      scrubColor,
      hairColor,
      skinTone,
      isFemale: avatarGender === 'female_atlm',
      isAtlmBadge: true,
    });
    playerAvatar.position.copy(playerPosRef.current);
    scene.add(playerAvatar);

    // Input Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      keysRef.current[code] = true;
      if (code === 'KeyE') {
        triggerInteract();
      }
      if (code === 'Space' && !isJumpingRef.current) {
        isJumpingRef.current = true;
        jumpVelocityRef.current = 6.5;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    let isDragging = false;
    let prevMouseX = 0;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      cameraYawRef.current -= deltaX * 0.006;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with afterDraw software GL guard
    let rafId = 0;
    let disposed = false;
    let prevTime = performance.now();
    const afterDraw = isSoftwareGl
      ? (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 33)
      : (cb: FrameRequestCallback) => requestAnimationFrame(cb);

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const elapsed = now * 0.001;

      // Player Movement (WASD / Arrow Keys + Shift Sprint)
      const isSprinting = keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight'];
      const moveSpeed = isSprinting ? 7.5 : 4.5;
      let moveX = 0;
      let moveZ = 0;

      if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) moveZ -= 1;
      if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) moveZ += 1;
      if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) moveX -= 1;
      if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) moveX += 1;

      const isMoving = moveX !== 0 || moveZ !== 0;
      if (isMoving) {
        const moveAngle = Math.atan2(moveX, moveZ) + cameraYawRef.current;
        playerYawRef.current = moveAngle;
        playerPosRef.current.x += Math.sin(moveAngle) * moveSpeed * dt;
        playerPosRef.current.z += Math.cos(moveAngle) * moveSpeed * dt;

        // Clamp within hospital bounds
        playerPosRef.current.x = Math.max(-22, Math.min(22, playerPosRef.current.x));
        playerPosRef.current.z = Math.max(-10, Math.min(20, playerPosRef.current.z));
      }

      // Jump physics
      if (isJumpingRef.current) {
        playerPosRef.current.y += jumpVelocityRef.current * dt;
        jumpVelocityRef.current -= 18 * dt;
        if (playerPosRef.current.y <= 0) {
          playerPosRef.current.y = 0;
          isJumpingRef.current = false;
          jumpVelocityRef.current = 0;
        }
      }

      // Update player avatar position & walking limb swing
      playerAvatar.position.copy(playerPosRef.current);
      playerAvatar.rotation.y = playerYawRef.current;

      const leftLeg = playerAvatar.getObjectByName('leftLeg');
      const rightLeg = playerAvatar.getObjectByName('rightLeg');
      const leftArm = playerAvatar.getObjectByName('leftArm');
      const rightArm = playerAvatar.getObjectByName('rightArm');
      if (leftLeg && rightLeg && leftArm && rightArm) {
        const swing = isMoving ? Math.sin(elapsed * (isSprinting ? 12 : 8)) * 0.45 : 0;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.7;
        rightArm.rotation.x = swing * 0.7;
      }

      // Third-person camera follow
      const camDist = 6.2;
      const camHeight = 3.6;
      camera.position.set(
        playerPosRef.current.x + Math.sin(cameraYawRef.current) * camDist,
        playerPosRef.current.y + camHeight,
        playerPosRef.current.z + Math.cos(cameraYawRef.current) * camDist
      );
      camera.lookAt(
        playerPosRef.current.x,
        playerPosRef.current.y + 1.6,
        playerPosRef.current.z
      );

      // Animate floating 3D blood cells & beacons
      floatingCells.forEach((fc) => {
        fc.group.rotation.y += dt * fc.speed;
        fc.group.rotation.x += dt * 0.35;
        fc.group.position.y = 3.2 + Math.sin(elapsed * fc.speed + fc.offset) * 0.35;
      });

      equipmentMeshes.forEach(({ group }) => {
        const ring = group.getObjectByName('beaconRing');
        if (ring) {
          ring.rotation.z = elapsed * 1.5;
        }
      });

      // Subtle idle motion for NPCs
      npcMeshes.forEach(({ group }, idx) => {
        group.position.y = Math.abs(Math.sin(elapsed * 1.4 + idx)) * 0.04;
      });

      // Check proximity to Lab Equipment & NPCs
      let closest: typeof nearbyTarget = null;
      let minDistance = 2.6;

      for (const eq of equipmentMeshes) {
        const d = playerPosRef.current.distanceTo(eq.group.position);
        if (d < minDistance) {
          minDistance = d;
          closest = {
            type: 'equipment',
            label: eq.item.indonesianName,
            data: eq.item,
          };
        }
      }

      for (const npcEntry of npcMeshes) {
        const d = playerPosRef.current.distanceTo(npcEntry.group.position);
        if (d < minDistance) {
          minDistance = d;
          closest = {
            type: 'npc',
            label: `${npcEntry.npc.name} (${npcEntry.npc.title})`,
            data: npcEntry.npc,
          };
        }
      }

      if (closest?.label !== nearbyTargetRef.current?.label) {
        nearbyTargetRef.current = closest;
        setNearbyTarget(closest);
      }

      renderer.render(scene, camera);
      rafId = afterDraw(animate) as unknown as number;
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [avatarGender, labCoatColor, scrubColor, hairColor, skinTone]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] min-h-[640px] bg-slate-950 overflow-hidden select-none">
      {/* 3D WebGL Viewport (>85% unobstructed canvas) */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Floating Hospital Zone & ATLM Identity Card */}
      <div className="absolute top-4 left-4 z-10 max-w-sm bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-xl p-3.5 text-white shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-sky-300">
              3D HOSPITAL & HEMATOLOGY LAB
            </p>
            <h3 className="text-sm font-bold leading-tight">{currentZone}</h3>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            {studentName} ({avatarGender === 'female_atlm' ? 'ATLM Wanita' : 'ATLM Pria'})
          </span>
          <span className="font-mono text-sky-300">NPM: {studentNpm}</span>
        </div>
      </div>

      {/* Top Right Quick Teleport & Lab Actions */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2">
        <button
          onClick={() => teleportToZone(0, 6, 'Lobby Utama & Profil dr. Juwita Ninda Suherman, M.Kes')}
          className="px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-xs font-medium text-white flex items-center gap-1.5 transition"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          Lobby Utama
        </button>
        <button
          onClick={() => teleportToZone(0, -3, 'Laboratorium Hematologi Futuristik')}
          className="px-3 py-2 rounded-lg bg-sky-600/90 hover:bg-sky-500 backdrop-blur-md border border-sky-400/40 text-xs font-semibold text-white flex items-center gap-1.5 transition"
        >
          <Microscope className="w-3.5 h-3.5" />
          Lab Hematologi
        </button>
        <button
          onClick={() => teleportToZone(-2, 8, 'Bangsal Rawat Inap & Kursi Flebotomi Pasien 3D')}
          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
        >
          <UserCheck className="w-3.5 h-3.5" />
          Bangsal 6 Pasien 3D
        </button>
        <button
          onClick={() => teleportToZone(6, 0, 'Ruang Konsultasi Dokter Spesialis')}
          className="px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-xs font-medium text-white flex items-center gap-1.5 transition"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          Ruang Dokter
        </button>
      </div>

      {/* Proximity Action Prompt ("Press E to Interact") */}
      {nearbyTarget && !selectedEquipment && !activeNpc && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md border border-sky-400/60 rounded-xl px-5 py-3 text-white shadow-2xl flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-sky-500 text-slate-950 font-mono font-bold text-xs">
            TEKAN E
          </span>
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wider text-sky-300 font-mono">
              {nearbyTarget.type === 'equipment' ? 'Inspeksi Alat Lab 3D' : 'Dialog Karakter Medis'}
            </p>
            <p className="text-sm font-semibold">{nearbyTarget.label}</p>
          </div>
          <button
            onClick={triggerInteract}
            className="ml-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold"
          >
            Buka
          </button>
        </div>
      )}

      {/* Interactive 3D Lab Equipment Modal */}
      {selectedEquipment && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
                  {selectedEquipment.category} • PDF Hal. {selectedEquipment.pdfPageRef}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedEquipment.indonesianName}
                </h3>
                <p className="text-xs text-slate-500">{selectedEquipment.name}</p>
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100">
                <h4 className="font-bold text-sky-950 text-xs uppercase tracking-wider mb-1">
                  Fungsi Utama di Laboratorium Hematologi
                </h4>
                <p>{selectedEquipment.functionSummary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                  Prinsip Kerja Instrumen
                </h4>
                <p className="text-slate-600 leading-relaxed">{selectedEquipment.operatingPrinciple}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Standar Operasional Prosedur (SOP) ATLM
                </h4>
                <ul className="space-y-1.5">
                  {selectedEquipment.atlmSOP.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider mb-1">
                  Aplikasi Klinis & Diagnostik
                </h4>
                <p className="text-emerald-900">{selectedEquipment.clinicalApplication}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                {onOpenCalculator && (
                  <button
                    onClick={() => {
                      setSelectedEquipment(null);
                      onOpenCalculator();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                  >
                    Buka Kalkulator MCV/MCH/MCHC
                  </button>
                )}
                {onOpenSimulation && (
                  <button
                    onClick={() => {
                      setSelectedEquipment(null);
                      onOpenSimulation();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Simulasi Kasus Klinis
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Tutup Inspeksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive NPC & 3D Patient Clinical Card Modal */}
      {activeNpc && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[94%] max-h-[75vh] overflow-y-auto bg-[#243b55]/95 backdrop-blur-md border border-sky-300/50 rounded-2xl p-5 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                {activeNpc.role === 'patient'
                  ? `REKAM KLINIS PASIEN 3D • ${activeNpc.patientClinicalCard?.rmNumber || ''}`
                  : `${activeNpc.zone} • ${activeNpc.dialogues[npcDialogueIndex]?.topic}`}
              </span>
              <h4 className="text-base md:text-lg font-bold text-white mt-0.5">{activeNpc.name}</h4>
              <p className="text-xs text-sky-200">{activeNpc.title}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDialogueLang(dialogueLang === 'id' ? 'en' : 'id')}
                className="px-2.5 py-1 rounded bg-[#314d6d] hover:bg-[#3c5d82] text-xs font-mono text-sky-200 border border-[#4a6c94]"
              >
                {dialogueLang === 'id' ? 'ID → EN' : 'EN → ID'}
              </button>
              <button
                onClick={() => {
                  const text =
                    dialogueLang === 'id'
                      ? activeNpc.dialogues[npcDialogueIndex].id
                      : activeNpc.dialogues[npcDialogueIndex].en;
                  soundManager.speakNpc(text, dialogueLang === 'id' ? 'id-ID' : 'en-US');
                }}
                className="p-1.5 rounded bg-sky-500/30 hover:bg-sky-500/50 text-sky-200 border border-sky-400/40"
                title="Dengarkan Suara Karakter"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveNpc(null)}
                className="p-1.5 rounded bg-[#314d6d] hover:bg-[#3c5d82] text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Patient Clinical & Lab Data Table when inspecting a 3D Patient */}
          {activeNpc.patientClinicalCard && (
            <div className="mt-3 rounded-xl bg-[#edf2f7] text-slate-800 border border-slate-300 p-3.5 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-300 font-mono">
                <span className="font-bold text-sky-900">
                  {activeNpc.patientClinicalCard.bedOrStation}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  {activeNpc.patientClinicalCard.diagnosisSummary}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <p className="font-mono font-bold text-[11px] uppercase text-sky-900">
                    Anamnesis & Pemeriksaan Fisik:
                  </p>
                  <p className="mt-0.5 leading-relaxed">{activeNpc.patientClinicalCard.anamnesis}</p>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    <strong>Fisik:</strong> {activeNpc.patientClinicalCard.physicalExam}
                  </p>
                </div>
                <div>
                  <p className="font-mono font-bold text-[11px] uppercase text-rose-900">
                    Hasil CBC & Indeks Eritrosit (MCV/MCH/MCHC):
                  </p>
                  <p className="mt-0.5 font-mono text-slate-900 font-medium leading-relaxed">
                    {activeNpc.patientClinicalCard.cbcAndIndices}
                  </p>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    <strong>Apusan Darah Tepi:</strong> {activeNpc.patientClinicalCard.smearMorphology}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-300 text-emerald-950 bg-emerald-100/60 p-2.5 rounded-lg">
                <strong>Keputusan ATLM & Terapi Dokter:</strong>{' '}
                {activeNpc.patientClinicalCard.atlmDecisionAndTherapy}
              </div>
            </div>
          )}

          <p className="mt-3 text-sm leading-relaxed text-slate-100 bg-[#1b2e43] p-3.5 rounded-xl border border-[#3a5778]">
            “
            {dialogueLang === 'id'
              ? activeNpc.dialogues[npcDialogueIndex]?.id
              : activeNpc.dialogues[npcDialogueIndex]?.en}
            ”
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-300 font-mono">
              Dialog {npcDialogueIndex + 1} / {activeNpc.dialogues.length}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setNpcDialogueIndex((prev) => (prev + 1) % activeNpc.dialogues.length)
                }
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
              >
                Dialog Berikutnya →
              </button>
              {onStartQuiz && (
                <button
                  onClick={() => {
                    setActiveNpc(null);
                    onStartQuiz();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" /> Mulai Kuis 50 Soal A–E
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Mobile Touch Pads + 6 Patients Selector + Lab Instruments) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[96%] max-w-5xl bg-[#243b55]/90 backdrop-blur-md border border-[#45678e] rounded-xl px-4 py-2.5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono text-sky-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> KONTROL AVATAR ATLM & PASIEN 3D
            </span>
            <span className="hidden md:inline text-slate-200">
              <strong className="text-white font-mono">WASD</strong> Jalan •{' '}
              <strong className="text-white font-mono">Shift</strong> Lari •{' '}
              <strong className="text-white font-mono">Space</strong> Lompat •{' '}
              <strong className="text-white font-mono">E</strong> Interaksi Pasien/Alat
            </span>
          </div>
          <button
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="text-xs text-slate-200 hover:text-white flex items-center gap-1 font-mono"
          >
            {dockCollapsed ? (
              <>
                Tampilkan Pasien & Alat 3D <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Sembunyikan <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {!dockCollapsed && (
          <div className="mt-2.5 pt-2.5 border-t border-[#3a5778] space-y-2">
            {/* Row 1: Direct Clickable 6 Clinical Patients in 3D */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-amber-300 mr-1">
                PASIEN 3D:
              </span>
              {HOSPITAL_NPCS.filter((n) => n.role === 'patient').map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => {
                    soundManager.playNpcInteract();
                    teleportToZone(pat.position[0], pat.position[2] + 1.8, pat.zone);
                    setActiveNpc(pat);
                    setNpcDialogueIndex(0);
                    setSelectedEquipment(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/35 border border-amber-300/50 text-[11px] font-semibold text-amber-100 flex items-center gap-1 transition"
                >
                  <UserCheck className="w-3 h-3 text-amber-300" />
                  {pat.name}
                </button>
              ))}
            </div>

            {/* Row 2: D-Pad + Lab Equipment Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onMouseDown={() => (keysRef.current['KeyW'] = true)}
                  onMouseUp={() => (keysRef.current['KeyW'] = false)}
                  onTouchStart={() => (keysRef.current['KeyW'] = true)}
                  onTouchEnd={() => (keysRef.current['KeyW'] = false)}
                  className="px-2.5 py-1 rounded bg-[#314d6d] hover:bg-[#3c5d82] text-xs font-mono border border-[#4a6c94]"
                >
                  ▲ Maju
                </button>
                <button
                  onMouseDown={() => (keysRef.current['KeyS'] = true)}
                  onMouseUp={() => (keysRef.current['KeyS'] = false)}
                  onTouchStart={() => (keysRef.current['KeyS'] = true)}
                  onTouchEnd={() => (keysRef.current['KeyS'] = false)}
                  className="px-2.5 py-1 rounded bg-[#314d6d] hover:bg-[#3c5d82] text-xs font-mono border border-[#4a6c94]"
                >
                  ▼ Mundur
                </button>
                <button
                  onMouseDown={() => (keysRef.current['KeyA'] = true)}
                  onMouseUp={() => (keysRef.current['KeyA'] = false)}
                  onTouchStart={() => (keysRef.current['KeyA'] = true)}
                  onTouchEnd={() => (keysRef.current['KeyA'] = false)}
                  className="px-2.5 py-1 rounded bg-[#314d6d] hover:bg-[#3c5d82] text-xs font-mono border border-[#4a6c94]"
                >
                  ◀ Kiri
                </button>
                <button
                  onMouseDown={() => (keysRef.current['KeyD'] = true)}
                  onMouseUp={() => (keysRef.current['KeyD'] = false)}
                  onTouchStart={() => (keysRef.current['KeyD'] = true)}
                  onTouchEnd={() => (keysRef.current['KeyD'] = false)}
                  className="px-2.5 py-1 rounded bg-[#314d6d] hover:bg-[#3c5d82] text-xs font-mono border border-[#4a6c94]"
                >
                  Kanan ▶
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {LAB_EQUIPMENT_3D_ITEMS.slice(0, 5).map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedEquipment(eq);
                    }}
                    className="px-2.5 py-1 rounded bg-[#1d3249] hover:bg-[#274360] border border-sky-400/40 text-[11px] text-sky-200 flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3 text-sky-300" />
                    {eq.indonesianName.split(' ')[0]} {eq.indonesianName.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
