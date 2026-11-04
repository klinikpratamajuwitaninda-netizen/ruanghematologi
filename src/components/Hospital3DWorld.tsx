import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  LAB_EQUIPMENT_3D_ITEMS,
  HOSPITAL_NPCS,
  LabEquipmentItem,
  NpcCharacterData,
} from '../data/clinicalSimulationData';
import { soundManager, CharacterSpeakingState } from '../utils/soundManager';
import {
  getCharacterVoiceProfile,
  detectDialogueEmotion,
  EMOTION_PROSODY_MAP,
} from '../utils/characterVoiceSystem';
import {
  Compass,
  Microscope,
  MessageSquare,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Play,
  X,
  UserCheck,
  Navigation,
  Smartphone,
  Monitor,
  Zap,
  ArrowUp,
  Footprints,
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
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

type ControlModePreference = 'auto' | 'mobile' | 'desktop';

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
  torso.name = 'torso';
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
  const handGeo = new THREE.SphereGeometry(0.13, 10, 10);
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
  head.name = 'head';
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.13, 2.05, 0.29);
  leftEye.name = 'leftEye';
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.13, 2.05, 0.29);
  rightEye.name = 'rightEye';
  group.add(rightEye);

  // Expressive Eyebrows (Animated during emotional speech)
  const browGeo = new THREE.BoxGeometry(0.11, 0.025, 0.02);
  const leftBrow = new THREE.Mesh(browGeo, hairMat);
  leftBrow.position.set(-0.13, 2.13, 0.295);
  leftBrow.name = 'leftBrow';
  group.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, hairMat);
  rightBrow.position.set(0.13, 2.13, 0.295);
  rightBrow.name = 'rightBrow';
  group.add(rightBrow);

  // Animated 3D Mouth for Lip-Sync (Synchronized with Character Voice Audio)
  const mouthGeo = new THREE.BoxGeometry(0.15, 0.06, 0.03);
  const mouthMat = new THREE.MeshBasicMaterial({
    color: options.isFemale ? '#be123c' : '#7f1d1d',
  });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 1.9, 0.295);
  mouth.scale.set(1, 0.28, 1);
  mouth.name = 'mouth';
  group.add(mouth);

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

  // 9: Floating 3D Voice Wave Halo (Visible when this NPC is speaking)
  const haloGeo = new THREE.RingGeometry(0.32, 0.42, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const speakingHalo = new THREE.Mesh(haloGeo, haloMat);
  speakingHalo.rotation.x = Math.PI / 2;
  speakingHalo.position.set(0, 2.52, 0);
  speakingHalo.visible = false;
  speakingHalo.name = 'speakingHalo';
  group.add(speakingHalo);

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

  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8);
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

    const sampleProbe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 10), darkMat);
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

    const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 10), accentMat);
    eyepiece.rotation.x = Math.PI / 5;
    eyepiece.position.set(0, 1.78, 0.08);
    group.add(eyepiece);
  } else if (item.id === 'centrifuge') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.56, 16), baseMat);
    body.position.set(0, 1.25, 0);
    group.add(body);

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.08, 16), accentMat);
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
  const ringGeo = new THREE.TorusGeometry(0.45, 0.035, 10, 24);
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

    const ivBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 10), ivPoleMat);
    ivBase.position.set(1.05, 0.04, -1.2);
    group.add(ivBase);

    const ivPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), ivPoleMat);
    ivPole.position.set(1.05, 1.1, -1.2);
    group.add(ivPole);

    const ivBag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.1), ivBagMat);
    ivBag.position.set(1.05, 1.95, -1.12);
    group.add(ivBag);
  } else {
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

  const patientRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.04, 10, 24),
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
    const rbcMat = new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.35,
      metalness: 0.1,
    });
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.14, 12, 24), rbcMat);
    outerRing.rotation.x = Math.PI / 2;
    group.add(outerRing);

    const centerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.09, 16), rbcMat);
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
    const cellBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 14), wbcMat);
    group.add(cellBody);

    const lobe1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), nucleusMat);
    lobe1.position.set(-0.12, 0.06, 0);
    group.add(lobe1);

    const lobe2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), nucleusMat);
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
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);

  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipmentItem | null>(null);
  const [activeNpc, setActiveNpc] = useState<NpcCharacterData | null>(null);
  const [npcDialogueIndex, setNpcDialogueIndex] = useState(0);
  const [dialogueLang, setDialogueLang] = useState<'id' | 'en'>('id');
  const [speakingState, setSpeakingState] = useState<CharacterSpeakingState>(
    soundManager.getSpeakingState()
  );
  const [audioSettingsState, setAudioSettingsState] = useState(soundManager.getSettings());

  // Subscribe to real-time character voice & lip-sync state
  useEffect(() => {
    const unsubscribe = soundManager.subscribeSpeakingState((st) => {
      setSpeakingState({ ...st });
      setAudioSettingsState(soundManager.getSettings());
    });
    return () => {
      unsubscribe();
      soundManager.stopSpeaking();
    };
  }, []);

  // Automatically play character voice when NPC dialogue opens or changes, and stop when closed
  useEffect(() => {
    if (!activeNpc) {
      soundManager.stopSpeaking();
      return;
    }
    const dialogueObj = activeNpc.dialogues[npcDialogueIndex];
    if (!dialogueObj) return;
    const text = dialogueLang === 'id' ? dialogueObj.id : dialogueObj.en;
    soundManager.speakCharacterDialogue({
      text,
      characterId: activeNpc.id,
      characterName: activeNpc.name,
      lang: dialogueLang === 'id' ? 'id-ID' : 'en-US',
    });
  }, [activeNpc, npcDialogueIndex, dialogueLang]);

  const [nearbyTarget, setNearbyTarget] = useState<{
    type: 'equipment' | 'npc';
    label: string;
    data: LabEquipmentItem | NpcCharacterData;
  } | null>(null);
  const [closestEquipmentState, setClosestEquipmentState] = useState<LabEquipmentItem | null>(null);
  const [closestNpcState, setClosestNpcState] = useState<NpcCharacterData | null>(null);

  const [currentZone, setCurrentZone] = useState<string>(
    'Lobby Utama & Profil Klinis IKES Rajawali'
  );
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(true);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Device & Control Mode Detection (Auto-detects Android/iOS touch vs Desktop keyboard/mouse)
  const [controlModePref, setControlModePref] = useState<ControlModePreference>('auto');
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(false);
  const [dismissPortraitHint, setDismissPortraitHint] = useState<boolean>(false);
  const [isRunToggled, setIsRunToggled] = useState<boolean>(false);

  // Virtual Joystick UI State (for rendering knob offset & visual tilt intensity)
  const [joystickUi, setJoystickUi] = useState<{
    active: boolean;
    offsetX: number;
    offsetY: number;
    magnitude: number;
  }>({ active: false, offsetX: 0, offsetY: 0, magnitude: 0 });

  // Refs for real-time 60fps Three.js loop (zero React re-render overhead per frame)
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickVectorRef = useRef<{ x: number; y: number; magnitude: number }>({
    x: 0,
    y: 0,
    magnitude: 0,
  });
  const joystickTouchIdRef = useRef<number | null>(null);
  const isRunToggledRef = useRef<boolean>(false);
  const actionPulseRef = useRef<number>(0);

  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 8));
  const playerYawRef = useRef<number>(Math.PI);
  const cameraYawRef = useRef<number>(0);
  const cameraPitchRef = useRef<number>(0.48); // Vertical orbit angle (clamped 0.15 to 1.15 rad)
  const cameraDistRef = useRef<number>(6.4); // Zoom distance (clamped 3.5 to 13.5)

  const jumpVelocityRef = useRef<number>(0);
  const isJumpingRef = useRef<boolean>(false);
  const nearbyTargetRef = useRef<typeof nearbyTarget>(null);
  const closestEquipmentRef = useRef<LabEquipmentItem | null>(null);
  const closestNpcRef = useRef<NpcCharacterData | null>(null);

  // Sync run toggle ref
  useEffect(() => {
    isRunToggledRef.current = isRunToggled;
  }, [isRunToggled]);

  // Detect touch device & screen orientation
  useEffect(() => {
    const checkViewportAndTouch = () => {
      const hasCoarsePointer =
        typeof window !== 'undefined' &&
        (window.matchMedia('(pointer: coarse)').matches ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth < 960);
      setIsTouchDevice(hasCoarsePointer);
      setIsPortraitMobile(window.innerWidth < 640 && window.innerHeight > window.innerWidth);
    };
    checkViewportAndTouch();
    window.addEventListener('resize', checkViewportAndTouch);
    window.addEventListener('orientationchange', checkViewportAndTouch);
    return () => {
      window.removeEventListener('resize', checkViewportAndTouch);
      window.removeEventListener('orientationchange', checkViewportAndTouch);
    };
  }, []);

  const showMobileHud =
    controlModePref === 'mobile' || (controlModePref === 'auto' && isTouchDevice);

  const showActionFeedback = useCallback((msg: string) => {
    setActionBanner(msg);
    window.setTimeout(() => {
      setActionBanner((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const teleportToZone = useCallback(
    (x: number, z: number, zoneTitle: string) => {
      soundManager.playDoor();
      playerPosRef.current.set(x, 0, z);
      setCurrentZone(zoneTitle);
      showActionFeedback(`Berpindah ke: ${zoneTitle}`);
    },
    [showActionFeedback]
  );

  // 1. JUMP Action Handler
  const handleJumpAction = useCallback(() => {
    if (!isJumpingRef.current) {
      soundManager.playClick();
      isJumpingRef.current = true;
      jumpVelocityRef.current = 7.2;
    }
  }, []);

  // 2. RUN Action Handler
  const handleToggleRun = useCallback(() => {
    soundManager.playClick();
    setIsRunToggled((prev) => {
      const next = !prev;
      showActionFeedback(next ? 'Mode Lari Cepat (Sprint) Aktif' : 'Mode Jalan Normal Aktif');
      return next;
    });
  }, [showActionFeedback]);

  // 3. INTERACT Action Handler (Equipment or Nearest Target)
  const triggerInteract = useCallback(() => {
    const target = nearbyTargetRef.current;
    if (target) {
      if (target.type === 'equipment') {
        soundManager.playClick();
        setSelectedEquipment(target.data as LabEquipmentItem);
        setActiveNpc(null);
        return;
      } else {
        soundManager.playNpcInteract();
        const npc = target.data as NpcCharacterData;
        setActiveNpc(npc);
        setNpcDialogueIndex(0);
        setSelectedEquipment(null);
        return;
      }
    }
    // If not within immediate 3.2m radius, interact with the nearest lab instrument by walking/teleporting to it
    const eq = closestEquipmentRef.current || LAB_EQUIPMENT_3D_ITEMS[0];
    if (eq) {
      soundManager.playClick();
      playerPosRef.current.set(eq.position[0], 0, eq.position[2] + 1.8);
      setSelectedEquipment(eq);
      setActiveNpc(null);
      showActionFeedback(`Membuka Inspeksi Alat: ${eq.indonesianName}`);
    }
  }, [showActionFeedback]);

  // 4. TALK Action Handler (Dedicated NPC / Doctor / Lecturer / Patient Conversation)
  const triggerTalkNpc = useCallback(() => {
    const target = nearbyTargetRef.current;
    if (target && target.type === 'npc') {
      soundManager.playNpcInteract();
      const npc = target.data as NpcCharacterData;
      setActiveNpc(npc);
      setNpcDialogueIndex(0);
      setSelectedEquipment(null);
      return;
    }
    const npc = closestNpcRef.current || HOSPITAL_NPCS[0];
    if (npc) {
      soundManager.playNpcInteract();
      playerPosRef.current.set(npc.position[0], 0, npc.position[2] + 1.8);
      setCurrentZone(npc.zone);
      setActiveNpc(npc);
      setNpcDialogueIndex(0);
      setSelectedEquipment(null);
      showActionFeedback(`Berbicara dengan: ${npc.name}`);
    }
  }, [showActionFeedback]);

  // 5. SPECIAL LAB ACTION Handler (3D Hematological Scan Pulse + Contextual Action)
  const triggerSpecialAction = useCallback(() => {
    soundManager.playClick();
    actionPulseRef.current = 1.0; // Triggers 3D expanding cyan diagnostic ring around avatar
    const target = nearbyTargetRef.current;
    if (target?.type === 'equipment') {
      setSelectedEquipment(target.data as LabEquipmentItem);
      showActionFeedback(`Memindai SOP Alat Lab: ${target.label}`);
    } else if (target?.type === 'npc') {
      setActiveNpc(target.data as NpcCharacterData);
      setNpcDialogueIndex(0);
      showActionFeedback(`Memeriksa Data Klinis: ${target.label}`);
    } else {
      showActionFeedback(
        'Pemindaian Hematologi 3D Aktif! Mendeteksi 10 Instrumen Lab & 6 Pasien Klinis di sekitar Anda.'
      );
    }
  }, [showActionFeedback]);

  // Virtual Joystick Multi-Touch Logic (Bottom-Left)
  const updateJoystickFromPoint = useCallback((clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.38;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const dist = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(rawDy, rawDx);

    const offsetX = Math.cos(angle) * clampedDist;
    const offsetY = Math.sin(angle) * clampedDist;
    const normX = maxRadius > 0 ? offsetX / maxRadius : 0;
    const normY = maxRadius > 0 ? offsetY / maxRadius : 0;
    const magnitude = maxRadius > 0 ? Math.min(1, dist / maxRadius) : 0;

    joystickVectorRef.current = { x: normX, y: normY, magnitude };
    setJoystickUi({
      active: true,
      offsetX,
      offsetY,
      magnitude,
    });
  }, []);

  const resetJoystick = useCallback(() => {
    joystickTouchIdRef.current = null;
    joystickVectorRef.current = { x: 0, y: 0, magnitude: 0 };
    setJoystickUi({ active: false, offsetX: 0, offsetY: 0, magnitude: 0 });
  }, []);

  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (!touch) return;
    joystickTouchIdRef.current = touch.identifier;
    updateJoystickFromPoint(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      if (t.identifier === joystickTouchIdRef.current) {
        updateJoystickFromPoint(t.clientX, t.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Pointer fallback so desktop users testing Mobile HUD with mouse can also drag the virtual joystick
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    joystickTouchIdRef.current = e.pointerId;
    updateJoystickFromPoint(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (joystickTouchIdRef.current !== e.pointerId) return;
    updateJoystickFromPoint(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (joystickTouchIdRef.current === e.pointerId) {
      resetJoystick();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#273e57');
    scene.fog = new THREE.FogExp2('#273e57', 0.014);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 140);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererName = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(rendererName);
    const isMobileViewport = window.innerWidth < 960 || navigator.maxTouchPoints > 0;

    // Adaptive pixel ratio for smooth mobile & desktop WebGL performance
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, isMobileViewport ? 1.5 : 2)
    );
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.userSelect = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmrem.dispose();

    // Lighting
    const ambientLight = new THREE.AmbientLight('#f8fafc', 0.8);
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

    // Hospital Walls & Architectural Boundaries
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#243b55',
      roughness: 0.5,
    });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(48, 6, 0.4), wallMat);
    backWall.position.set(0, 3, -12);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 36), wallMat);
    leftWall.position.set(-24, 3, 6);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 36), wallMat);
    rightWall.position.set(24, 3, 6);
    scene.add(rightWall);

    // 10 Lab Instruments in 3D
    const clickableRoots: THREE.Object3D[] = [];
    const equipmentMeshes: { item: LabEquipmentItem; group: THREE.Group }[] = [];
    LAB_EQUIPMENT_3D_ITEMS.forEach((eqItem) => {
      const eqGroup = buildLabInstrumentGroup(eqItem);
      eqGroup.position.set(eqItem.position[0], eqItem.position[1], eqItem.position[2]);
      eqGroup.userData = { interactType: 'equipment', item: eqItem };
      scene.add(eqGroup);
      equipmentMeshes.push({ item: eqItem, group: eqGroup });
      clickableRoots.push(eqGroup);
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
        stationMesh.userData = { interactType: 'npc', npc };
        scene.add(stationMesh);
        clickableRoots.push(stationMesh);
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
      npcGroup.userData = { interactType: 'npc', npc };
      scene.add(npcGroup);
      npcMeshes.push({
        npc,
        group: npcGroup,
        basePos: new THREE.Vector3(npc.position[0], npc.position[1], npc.position[2]),
      });
      clickableRoots.push(npcGroup);
    });

    // Floating 3D Red Blood Cells, White Blood Cells & Platelets in the Hospital Atrium
    const floatingCells: { group: THREE.Group; speed: number; offset: number }[] = [];
    const cellCount = isMobileViewport ? 12 : 18;
    for (let i = 0; i < cellCount; i++) {
      const cellType = i % 3 === 0 ? 'wbc' : i % 5 === 0 ? 'plt' : 'rbc';
      const cellGroup = build3DBloodCell(cellType);
      const angle = (i / cellCount) * Math.PI * 2;
      const radius = 9 + (i % 4) * 2.5;
      cellGroup.position.set(
        Math.cos(angle) * radius,
        3.2 + (i % 3) * 0.8,
        Math.sin(angle) * radius
      );
      scene.add(cellGroup);
      floatingCells.push({ group: cellGroup, speed: 0.6 + (i % 4) * 0.2, offset: i });
    }

    // Playable ATLM Student Avatar (Male ATLM or Female ATLM)
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

    // 3D Diagnostic Scan Pulse Ring around Avatar (activated by ACTION button)
    const scanPulseGeo = new THREE.RingGeometry(0.45, 0.65, 32);
    const scanPulseMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const scanPulseMesh = new THREE.Mesh(scanPulseGeo, scanPulseMat);
    scanPulseMesh.rotation.x = -Math.PI / 2;
    scanPulseMesh.position.y = 0.06;
    scanPulseMesh.visible = false;
    scene.add(scanPulseMesh);

    // Pre-allocated math objects for zero per-frame GC pressure
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const smoothCameraPos = new THREE.Vector3(
      playerPosRef.current.x,
      playerPosRef.current.y + 3.8,
      playerPosRef.current.z + 6.4
    );
    const desiredCameraPos = new THREE.Vector3();
    const smoothLookTarget = new THREE.Vector3(
      playerPosRef.current.x,
      playerPosRef.current.y + 1.6,
      playerPosRef.current.z
    );
    const desiredLookTarget = new THREE.Vector3();

    // Raycast helper for tapping/clicking directly on 3D NPCs or Lab Instruments
    const trySelect3DObjectAt = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableRoots, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.interactType) {
          obj = obj.parent;
        }
        if (obj?.userData?.interactType === 'equipment') {
          const eq = obj.userData.item as LabEquipmentItem;
          soundManager.playClick();
          setSelectedEquipment(eq);
          setActiveNpc(null);
          return true;
        }
        if (obj?.userData?.interactType === 'npc') {
          const npc = obj.userData.npc as NpcCharacterData;
          soundManager.playNpcInteract();
          setActiveNpc(npc);
          setNpcDialogueIndex(0);
          setSelectedEquipment(null);
          return true;
        }
      }
      return false;
    };

    // Keyboard Input Event Listeners (Desktop)
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      const code = e.code;
      keysRef.current[code] = true;
      if (code === 'KeyE') {
        triggerInteract();
      } else if (code === 'KeyT') {
        triggerTalkNpc();
      } else if (code === 'KeyF' || code === 'KeyQ') {
        triggerSpecialAction();
      } else if (code === 'Space' && !isJumpingRef.current) {
        e.preventDefault();
        isJumpingRef.current = true;
        jumpVelocityRef.current = 7.2;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    // Mouse Orbit & Wheel Zoom (Desktop)
    let isMouseDragging = false;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDragging = true;
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraYawRef.current -= deltaX * 0.0065;
      cameraPitchRef.current = THREE.MathUtils.clamp(
        cameraPitchRef.current + deltaY * 0.005,
        0.15,
        1.15
      );
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isMouseDragging) return;
      isMouseDragging = false;
      const moveDist = Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY);
      if (moveDist < 6) {
        trySelect3DObjectAt(e.clientX, e.clientY);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistRef.current = THREE.MathUtils.clamp(
        cameraDistRef.current + e.deltaY * 0.006,
        3.5,
        13.5
      );
    };

    // Multi-Touch 3D Camera Swipe (1-Finger Orbit) & Pinch-to-Zoom (2-Finger Zoom) on Canvas
    let cameraTouchId: number | null = null;
    let camTouchStartX = 0;
    let camTouchStartY = 0;
    let camTouchPrevX = 0;
    let camTouchPrevY = 0;
    let pinchPrevDist: number | null = null;

    const getCanvasTouches = (touchList: TouchList): Touch[] => {
      const arr: Touch[] = [];
      for (let i = 0; i < touchList.length; i++) {
        const t = touchList[i];
        // Ignore the thumb touch that is currently operating the bottom-left virtual joystick
        if (t.identifier !== joystickTouchIdRef.current) {
          arr.push(t);
        }
      }
      return arr;
    };

    const onCanvasTouchStart = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const freeTouches = getCanvasTouches(e.touches);
      if (freeTouches.length === 1) {
        const t = freeTouches[0];
        cameraTouchId = t.identifier;
        camTouchStartX = t.clientX;
        camTouchStartY = t.clientY;
        camTouchPrevX = t.clientX;
        camTouchPrevY = t.clientY;
        pinchPrevDist = null;
      } else if (freeTouches.length >= 2) {
        cameraTouchId = null;
        pinchPrevDist = Math.hypot(
          freeTouches[0].clientX - freeTouches[1].clientX,
          freeTouches[0].clientY - freeTouches[1].clientY
        );
      }
    };

    const onCanvasTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const freeTouches = getCanvasTouches(e.touches);

      if (freeTouches.length >= 2) {
        const dist = Math.hypot(
          freeTouches[0].clientX - freeTouches[1].clientX,
          freeTouches[0].clientY - freeTouches[1].clientY
        );
        if (pinchPrevDist !== null) {
          const deltaPinch = pinchPrevDist - dist;
          cameraDistRef.current = THREE.MathUtils.clamp(
            cameraDistRef.current + deltaPinch * 0.025,
            3.5,
            13.5
          );
        }
        pinchPrevDist = dist;
        return;
      }

      if (freeTouches.length === 1) {
        const t = freeTouches[0];
        if (cameraTouchId === null) {
          cameraTouchId = t.identifier;
          camTouchPrevX = t.clientX;
          camTouchPrevY = t.clientY;
          return;
        }
        if (t.identifier === cameraTouchId) {
          const dx = t.clientX - camTouchPrevX;
          const dy = t.clientY - camTouchPrevY;
          camTouchPrevX = t.clientX;
          camTouchPrevY = t.clientY;

          cameraYawRef.current -= dx * 0.0075;
          cameraPitchRef.current = THREE.MathUtils.clamp(
            cameraPitchRef.current + dy * 0.0055,
            0.15,
            1.15
          );
        }
      }
    };

    const onCanvasTouchEnd = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const ct = e.changedTouches[i];
        if (ct.identifier === cameraTouchId) {
          const moved = Math.hypot(ct.clientX - camTouchStartX, ct.clientY - camTouchStartY);
          if (moved < 10) {
            trySelect3DObjectAt(ct.clientX, ct.clientY);
          }
          cameraTouchId = null;
        }
      }
      const remaining = getCanvasTouches(e.touches);
      if (remaining.length < 2) {
        pinchPrevDist = null;
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
    };

    const domElem = renderer.domElement;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('touchstart', onCanvasTouchStart, { passive: false });
    domElem.addEventListener('touchmove', onCanvasTouchMove, { passive: false });
    domElem.addEventListener('touchend', onCanvasTouchEnd, { passive: false });
    domElem.addEventListener('touchcancel', onCanvasTouchEnd, { passive: false });
    domElem.addEventListener('webglcontextlost', onContextLost, false);

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

      // Combine Keyboard (WASD / Arrow Keys) + Virtual Touch Joystick Input
      let inputX = 0;
      let inputZ = 0;

      if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) inputZ -= 1;
      if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) inputZ += 1;
      if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) inputX -= 1;
      if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) inputX += 1;

      const joy = joystickVectorRef.current;
      if (joy.magnitude > 0.06) {
        inputX += joy.x;
        inputZ += joy.y;
      }

      const rawMag = Math.hypot(inputX, inputZ);
      const normalizedMag = Math.min(1, rawMag);
      const isSprinting =
        keysRef.current['ShiftLeft'] ||
        keysRef.current['ShiftRight'] ||
        isRunToggledRef.current ||
        joy.magnitude > 0.78;

      const baseSpeed = isSprinting ? 7.8 : 4.6;
      const effectiveSpeed = baseSpeed * (normalizedMag > 0 ? Math.max(0.35, normalizedMag) : 0);

      const isMoving = normalizedMag > 0.05;
      if (isMoving) {
        const moveAngle = Math.atan2(inputX, inputZ) + cameraYawRef.current;

        // Smooth avatar rotation toward movement heading
        let angleDiff = moveAngle - playerYawRef.current;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        playerYawRef.current += angleDiff * Math.min(1, dt * 14);

        playerPosRef.current.x += Math.sin(moveAngle) * effectiveSpeed * dt;
        playerPosRef.current.z += Math.cos(moveAngle) * effectiveSpeed * dt;

        // Clamp within hospital walls
        playerPosRef.current.x = THREE.MathUtils.clamp(playerPosRef.current.x, -22.2, 22.2);
        playerPosRef.current.z = THREE.MathUtils.clamp(playerPosRef.current.z, -10.4, 20.5);
      }

      // Jump physics (Gravity & Vertical Velocity)
      if (isJumpingRef.current) {
        playerPosRef.current.y += jumpVelocityRef.current * dt;
        jumpVelocityRef.current -= 19.5 * dt;
        if (playerPosRef.current.y <= 0) {
          playerPosRef.current.y = 0;
          isJumpingRef.current = false;
          jumpVelocityRef.current = 0;
        }
      }

      // Update player avatar position & walking/running/jumping limb animation
      playerAvatar.position.copy(playerPosRef.current);
      playerAvatar.rotation.y = playerYawRef.current;

      const leftLeg = playerAvatar.getObjectByName('leftLeg');
      const rightLeg = playerAvatar.getObjectByName('rightLeg');
      const leftArm = playerAvatar.getObjectByName('leftArm');
      const rightArm = playerAvatar.getObjectByName('rightArm');
      if (leftLeg && rightLeg && leftArm && rightArm) {
        if (isJumpingRef.current) {
          leftLeg.rotation.x = -0.35;
          rightLeg.rotation.x = 0.25;
          leftArm.rotation.x = -0.85;
          rightArm.rotation.x = -0.85;
        } else if (isMoving) {
          const swingFreq = isSprinting ? 13 : 8.5;
          const swingAmp = isSprinting ? 0.58 : 0.42;
          const swing = Math.sin(elapsed * swingFreq) * swingAmp * normalizedMag;
          leftLeg.rotation.x = swing;
          rightLeg.rotation.x = -swing;
          leftArm.rotation.x = -swing * 0.75;
          rightArm.rotation.x = swing * 0.75;
        } else {
          // Subtle idle breathing pose
          leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, dt * 10);
          rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, dt * 10);
          leftArm.rotation.x = THREE.MathUtils.lerp(
            leftArm.rotation.x,
            Math.sin(elapsed * 2) * 0.03,
            dt * 8
          );
          rightArm.rotation.x = THREE.MathUtils.lerp(
            rightArm.rotation.x,
            -Math.sin(elapsed * 2) * 0.03,
            dt * 8
          );
        }
      }

      // Animate 3D Diagnostic Scan Pulse Ring when ACTION is pressed
      if (actionPulseRef.current > 0) {
        scanPulseMesh.visible = true;
        actionPulseRef.current = Math.max(0, actionPulseRef.current - dt * 1.15);
        const progress = 1 - actionPulseRef.current;
        const scale = 1 + progress * 7.5;
        scanPulseMesh.position.set(playerPosRef.current.x, 0.06, playerPosRef.current.z);
        scanPulseMesh.scale.set(scale, scale, 1);
        scanPulseMat.opacity = actionPulseRef.current * 0.85;
      } else if (scanPulseMesh.visible) {
        scanPulseMesh.visible = false;
      }

      // Smooth Damped Third-Person Orbit Camera with Wall/Floor Collision Clamping
      const dist = cameraDistRef.current;
      const pitch = cameraPitchRef.current;
      const yaw = cameraYawRef.current;

      const horizontalRadius = dist * Math.cos(pitch);
      const verticalOffset = dist * Math.sin(pitch) + 1.45;

      const rawCamX = playerPosRef.current.x + Math.sin(yaw) * horizontalRadius;
      const rawCamY = playerPosRef.current.y + verticalOffset;
      const rawCamZ = playerPosRef.current.z + Math.cos(yaw) * horizontalRadius;

      // Clamp camera inside hospital walls so camera never clips outside the building
      desiredCameraPos.set(
        THREE.MathUtils.clamp(rawCamX, -23.3, 23.3),
        Math.max(0.85, rawCamY),
        THREE.MathUtils.clamp(rawCamZ, -11.4, 22.5)
      );

      desiredLookTarget.set(
        playerPosRef.current.x,
        playerPosRef.current.y + 1.65,
        playerPosRef.current.z
      );

      const dampFactor = 1 - Math.exp(-12 * dt);
      smoothCameraPos.lerp(desiredCameraPos, dampFactor);
      smoothLookTarget.lerp(desiredLookTarget, dampFactor);

      camera.position.copy(smoothCameraPos);
      camera.lookAt(smoothLookTarget);

      // Animate floating 3D blood cells & beacons
      for (let i = 0; i < floatingCells.length; i++) {
        const fc = floatingCells[i];
        fc.group.rotation.y += dt * fc.speed;
        fc.group.rotation.x += dt * 0.35;
        fc.group.position.y = 3.2 + Math.sin(elapsed * fc.speed + fc.offset) * 0.35;
      }

      for (let i = 0; i < equipmentMeshes.length; i++) {
        const ring = equipmentMeshes[i].group.getObjectByName('beaconRing');
        if (ring) {
          ring.rotation.z = elapsed * 1.5;
        }
      }

      const liveSpeech = soundManager.getSpeakingState();
      for (let i = 0; i < npcMeshes.length; i++) {
        const entry = npcMeshes[i];
        const npcGroup = entry.group;
        const isThisNpcSpeaking =
          liveSpeech.isSpeaking && liveSpeech.characterId === entry.npc.id;

        const mouthObj = npcGroup.getObjectByName('mouth');
        const headObj = npcGroup.getObjectByName('head');
        const leftBrowObj = npcGroup.getObjectByName('leftBrow');
        const rightBrowObj = npcGroup.getObjectByName('rightBrow');
        const leftArmObj = npcGroup.getObjectByName('leftArm');
        const rightArmObj = npcGroup.getObjectByName('rightArm');
        const haloObj = npcGroup.getObjectByName('speakingHalo');

        if (isThisNpcSpeaking) {
          // Smoothly turn NPC toward the student avatar during conversation
          const dx = playerPosRef.current.x - npcGroup.position.x;
          const dz = playerPosRef.current.z - npcGroup.position.z;
          const targetYaw = Math.atan2(dx, dz);
          let yawDiff = targetYaw - npcGroup.rotation.y;
          while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
          while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
          npcGroup.rotation.y += yawDiff * Math.min(1, dt * 8);

          // Expressive 3D Lip-Sync mouth movement
          if (mouthObj) {
            const openAmt = Math.max(0.15, liveSpeech.mouthOpenness);
            mouthObj.scale.y = THREE.MathUtils.lerp(mouthObj.scale.y, 0.35 + openAmt * 2.35, dt * 24);
            mouthObj.scale.x = THREE.MathUtils.lerp(mouthObj.scale.x, 0.88 + openAmt * 0.35, dt * 20);
          }

          // Expressive head nod & emotional tilt
          if (headObj) {
            const nod = Math.sin(elapsed * 6.8) * 0.055 * (liveSpeech.gestureIntensity || 1);
            const tilt = (liveSpeech.headTiltRad || 0) + Math.sin(elapsed * 2.8) * 0.025;
            headObj.rotation.x = THREE.MathUtils.lerp(headObj.rotation.x, nod, dt * 12);
            headObj.rotation.z = THREE.MathUtils.lerp(headObj.rotation.z, tilt, dt * 10);
          }

          // Eyebrow emotional expression
          if (leftBrowObj && rightBrowObj) {
            const browLift =
              liveSpeech.emotion === 'Surprised' || liveSpeech.emotion === 'Curious'
                ? 2.155
                : liveSpeech.emotion === 'Serious' || liveSpeech.emotion === 'Angry'
                ? 2.115
                : 2.135;
            leftBrowObj.position.y = THREE.MathUtils.lerp(leftBrowObj.position.y, browLift, dt * 12);
            rightBrowObj.position.y = THREE.MathUtils.lerp(rightBrowObj.position.y, browLift, dt * 12);
          }

          // Natural hand gestures while speaking
          if (rightArmObj && leftArmObj) {
            const gestureWave = Math.abs(Math.sin(elapsed * 5.2)) * 0.38 * (liveSpeech.gestureIntensity || 1);
            rightArmObj.rotation.x = THREE.MathUtils.lerp(rightArmObj.rotation.x, -0.32 - gestureWave, dt * 12);
            leftArmObj.rotation.x = THREE.MathUtils.lerp(
              leftArmObj.rotation.x,
              -0.12 - Math.abs(Math.cos(elapsed * 4.1)) * 0.2,
              dt * 10
            );
          }

          if (haloObj) {
            haloObj.visible = true;
            const pulse = 1 + Math.sin(elapsed * 7.5) * 0.18;
            haloObj.scale.set(pulse, pulse, 1);
            haloObj.rotation.z = elapsed * 2.2;
          }

          npcGroup.position.y = Math.abs(Math.sin(elapsed * 3.2)) * 0.06;
        } else {
          // Return immediately to calm idle pose when not speaking
          if (mouthObj) {
            mouthObj.scale.y = THREE.MathUtils.lerp(mouthObj.scale.y, 0.28, dt * 16);
            mouthObj.scale.x = THREE.MathUtils.lerp(mouthObj.scale.x, 1.0, dt * 16);
          }
          if (headObj) {
            headObj.rotation.x = THREE.MathUtils.lerp(headObj.rotation.x, 0, dt * 10);
            headObj.rotation.z = THREE.MathUtils.lerp(headObj.rotation.z, 0, dt * 10);
          }
          if (leftBrowObj && rightBrowObj) {
            leftBrowObj.position.y = THREE.MathUtils.lerp(leftBrowObj.position.y, 2.13, dt * 10);
            rightBrowObj.position.y = THREE.MathUtils.lerp(rightBrowObj.position.y, 2.13, dt * 10);
          }
          if (rightArmObj && leftArmObj) {
            rightArmObj.rotation.x = THREE.MathUtils.lerp(rightArmObj.rotation.x, 0, dt * 10);
            leftArmObj.rotation.x = THREE.MathUtils.lerp(leftArmObj.rotation.x, 0, dt * 10);
          }
          if (haloObj && haloObj.visible) {
            haloObj.visible = false;
          }
          npcGroup.position.y = Math.abs(Math.sin(elapsed * 1.4 + i)) * 0.04;
        }
      }

      // Proximity detection for Lab Equipment & NPCs
      let closestAny: typeof nearbyTarget = null;
      let minAnyDist = 3.1;

      let nearestEq: LabEquipmentItem | null = null;
      let minEqDist = Infinity;

      for (let i = 0; i < equipmentMeshes.length; i++) {
        const eq = equipmentMeshes[i];
        const d = playerPosRef.current.distanceTo(eq.group.position);
        if (d < minEqDist) {
          minEqDist = d;
          nearestEq = eq.item;
        }
        if (d < minAnyDist) {
          minAnyDist = d;
          closestAny = {
            type: 'equipment',
            label: eq.item.indonesianName,
            data: eq.item,
          };
        }
      }

      let nearestNpc: NpcCharacterData | null = null;
      let minNpcDist = Infinity;

      for (let i = 0; i < npcMeshes.length; i++) {
        const npcEntry = npcMeshes[i];
        const d = playerPosRef.current.distanceTo(npcEntry.group.position);
        if (d < minNpcDist) {
          minNpcDist = d;
          nearestNpc = npcEntry.npc;
        }
        if (d < minAnyDist) {
          minAnyDist = d;
          closestAny = {
            type: 'npc',
            label: `${npcEntry.npc.name} (${npcEntry.npc.title})`,
            data: npcEntry.npc,
          };
        }
      }

      if (closestAny?.label !== nearbyTargetRef.current?.label) {
        nearbyTargetRef.current = closestAny;
        setNearbyTarget(closestAny);
      }
      if (nearestEq?.id !== closestEquipmentRef.current?.id) {
        closestEquipmentRef.current = nearestEq;
        setClosestEquipmentState(nearestEq);
      }
      if (nearestNpc?.id !== closestNpcRef.current?.id) {
        closestNpcRef.current = nearestNpc;
        setClosestNpcState(nearestNpc);
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
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('touchstart', onCanvasTouchStart);
      domElem.removeEventListener('touchmove', onCanvasTouchMove);
      domElem.removeEventListener('touchend', onCanvasTouchEnd);
      domElem.removeEventListener('touchcancel', onCanvasTouchEnd);
      domElem.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('resize', handleResize);
      envTexture.dispose();
      renderer.dispose();
    };
  }, [
    avatarGender,
    labCoatColor,
    scrubColor,
    hairColor,
    skinTone,
    triggerInteract,
    triggerTalkNpc,
    triggerSpecialAction,
  ]);

  return (
    <div
      className="relative w-full h-[calc(100vh-4rem)] min-h-[560px] bg-slate-950 overflow-hidden select-none"
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
    >
      {/* 3D WebGL Viewport (>85% unobstructed canvas) */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Subtle Portrait Orientation Suggestion Banner on Narrow Mobile Screens (Non-blocking) */}
      {isPortraitMobile && !dismissPortraitHint && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-sm bg-slate-900/90 backdrop-blur-md border border-sky-400/40 rounded-xl px-3.5 py-2 text-white text-[11px] flex items-center justify-between gap-2 shadow-lg">
          <span className="flex items-center gap-1.5 text-sky-200">
            <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0 rotate-90" />
            Tip: Mode Landscape memberikan pandangan Lab 3D lebih luas (Portrait tetap aktif).
          </span>
          <button
            type="button"
            onClick={() => setDismissPortraitHint(true)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Left Floating Hospital Zone & ATLM Identity Card (Compact on Mobile) */}
      <div className="absolute top-3 left-3 z-10 max-w-[260px] sm:max-w-sm bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-xl p-2.5 sm:p-3.5 text-white shadow-xl pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-sky-300 truncate">
              3D HOSPITAL & HEMATOLOGY LAB
            </p>
            <h3 className="text-xs sm:text-sm font-bold leading-tight truncate">{currentZone}</h3>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 truncate">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{studentName}</span>
          </span>
          <span className="font-mono text-sky-300 shrink-0">NPM: {studentNpm}</span>
        </div>
      </div>

      {/* Top Right Quick Teleport, Audio Activation Button & Control Mode Switcher */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap justify-end gap-1.5 max-w-[65%] sm:max-w-none pointer-events-auto">
        <button
          type="button"
          onClick={async () => {
            if (!audioSettingsState.isAudioUnlocked || audioSettingsState.isMuted) {
              await soundManager.unlockAudioEngine(true);
              setAudioSettingsState(soundManager.getSettings());
              showActionFeedback(
                'Suara Karakter 3D & Audio Android Diaktifkan untuk Seluruh Sesi!'
              );
              if (activeNpc) {
                const dlg = activeNpc.dialogues[npcDialogueIndex];
                if (dlg) {
                  soundManager.speakCharacterDialogue({
                    text: dialogueLang === 'id' ? dlg.id : dlg.en,
                    characterId: activeNpc.id,
                    characterName: activeNpc.name,
                    lang: dialogueLang === 'id' ? 'id-ID' : 'en-US',
                  });
                }
              }
            } else {
              soundManager.setMuted(true);
              setAudioSettingsState(soundManager.getSettings());
              showActionFeedback('Suara Dimatikan Sementara (Mute)');
            }
          }}
          className={`px-2.5 py-1.5 rounded-lg backdrop-blur-md border text-[11px] font-mono font-bold flex items-center gap-1.5 transition shadow ${
            !audioSettingsState.isAudioUnlocked || audioSettingsState.isMuted
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-white animate-pulse'
              : 'bg-slate-900/85 hover:bg-slate-800 text-emerald-300 border-emerald-400/50'
          }`}
          title="Aktifkan Suara Karakter 3D (Kompatibel Android & Desktop)"
        >
          {!audioSettingsState.isAudioUnlocked || audioSettingsState.isMuted ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>AKTIFKAN SUARA</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Suara:</span>
              <span>ON</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            setControlModePref((prev) =>
              prev === 'auto' ? 'mobile' : prev === 'mobile' ? 'desktop' : 'auto'
            )
          }
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-sky-400/50 text-[11px] font-mono font-semibold text-sky-200 flex items-center gap-1.5 transition shadow"
          title="Ganti Mode Kontrol (Otomatis / Layar Sentuh HP / Keyboard Desktop)"
        >
          {showMobileHud ? (
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span className="hidden sm:inline">Kontrol:</span>
          <span>
            {controlModePref === 'auto'
              ? showMobileHud
                ? 'Otomatis (HP)'
                : 'Otomatis (PC)'
              : controlModePref === 'mobile'
              ? 'Sentuh HP'
              : 'Desktop'}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            teleportToZone(0, 6, 'Lobby Utama & Profil dr. Juwita Ninda Suherman, M.Kes')
          }
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-[11px] font-medium text-white flex items-center gap-1 transition"
        >
          <Navigation className="w-3 h-3 text-sky-400" />
          <span>Lobby</span>
        </button>
        <button
          type="button"
          onClick={() => teleportToZone(0, -3, 'Laboratorium Hematologi Futuristik')}
          className="px-2.5 py-1.5 rounded-lg bg-sky-600/90 hover:bg-sky-500 backdrop-blur-md border border-sky-400/40 text-[11px] font-semibold text-white flex items-center gap-1 transition"
        >
          <Microscope className="w-3 h-3" />
          <span>Lab 3D</span>
        </button>
        <button
          type="button"
          onClick={() => teleportToZone(-2, 8, 'Bangsal Rawat Inap & Kursi Flebotomi Pasien 3D')}
          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition shadow"
        >
          <UserCheck className="w-3 h-3" />
          <span>6 Pasien</span>
        </button>
        <button
          type="button"
          onClick={() => teleportToZone(6, 0, 'Ruang Konsultasi Dokter Spesialis')}
          className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-[11px] font-medium text-white items-center gap-1 transition"
        >
          <MessageSquare className="w-3 h-3 text-emerald-400" />
          <span>Ruang Dokter</span>
        </button>
      </div>

      {/* Camera Zoom & Reset Helper Controls (Right Middle Edge) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1.5 bg-slate-900/75 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 text-white shadow-lg pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            cameraDistRef.current = THREE.MathUtils.clamp(cameraDistRef.current - 1.2, 3.5, 13.5);
          }}
          className="p-2 rounded-lg hover:bg-slate-800 active:scale-90 transition"
          title="Perbesar Kamera (Zoom In)"
        >
          <ZoomIn className="w-4 h-4 text-sky-300" />
        </button>
        <button
          type="button"
          onClick={() => {
            cameraDistRef.current = THREE.MathUtils.clamp(cameraDistRef.current + 1.2, 3.5, 13.5);
          }}
          className="p-2 rounded-lg hover:bg-slate-800 active:scale-90 transition"
          title="Perkecil Kamera (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4 text-sky-300" />
        </button>
        <button
          type="button"
          onClick={() => {
            cameraYawRef.current = 0;
            cameraPitchRef.current = 0.48;
            cameraDistRef.current = 6.4;
            showActionFeedback('Sudut Kamera 3D Direset');
          }}
          className="p-2 rounded-lg hover:bg-slate-800 active:scale-90 transition"
          title="Reset Sudut Kamera"
        >
          <RotateCcw className="w-4 h-4 text-amber-300" />
        </button>
      </div>

      {/* Action / Status Feedback Toast */}
      {actionBanner && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md border border-sky-400/50 rounded-full px-4 py-1.5 text-xs font-mono font-semibold text-sky-200 shadow-xl pointer-events-none">
          {actionBanner}
        </div>
      )}

      {/* Proximity Action Prompt ("Press E / Tap to Interact") */}
      {nearbyTarget && !selectedEquipment && !activeNpc && (
        <div className="absolute bottom-40 sm:bottom-28 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md border border-sky-400/60 rounded-xl px-4 py-2.5 text-white shadow-2xl flex items-center gap-3 max-w-[92vw] pointer-events-auto">
          <span className="px-2 py-1 rounded bg-sky-500 text-slate-950 font-mono font-bold text-[11px] shrink-0">
            {showMobileHud ? 'DEKAT' : 'TEKAN E'}
          </span>
          <div className="text-left min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-sky-300 font-mono truncate">
              {nearbyTarget.type === 'equipment' ? 'Inspeksi Alat Lab 3D' : 'Dialog Karakter Medis'}
            </p>
            <p className="text-xs sm:text-sm font-semibold truncate">{nearbyTarget.label}</p>
          </div>
          <button
            type="button"
            onClick={triggerInteract}
            className="ml-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-xs font-bold shrink-0"
          >
            {nearbyTarget.type === 'equipment' ? 'Inspeksi' : 'Bicara'}
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ROBLOX-STYLE MOBILE & ANDROID TOUCH CONTROLS HUD                      */}
      {/* Left: Multi-Touch 360° Analog Virtual Joystick                        */}
      {/* Right: Ergonomic Action Buttons (JUMP, RUN, INTERACT, TALK, ACTION)   */}
      {/* ===================================================================== */}
      {showMobileHud && !selectedEquipment && !activeNpc && (
        <>
          {/* LEFT: 360° Virtual Analog Joystick */}
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            onTouchCancel={handleJoystickTouchEnd}
            onPointerDown={handleJoystickPointerDown}
            onPointerMove={handleJoystickPointerMove}
            onPointerUp={handleJoystickPointerUp}
            onPointerCancel={handleJoystickPointerUp}
            className="absolute bottom-14 left-4 sm:bottom-16 sm:left-6 z-20 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/45 backdrop-blur-md border-2 border-white/25 shadow-2xl flex items-center justify-center touch-none select-none pointer-events-auto"
            style={{ touchAction: 'none' }}
            aria-label="Virtual Joystick Penggerak Avatar 3D"
          >
            {/* Outer Compass Ring Markings */}
            <div className="absolute inset-2 rounded-full border border-sky-400/25 pointer-events-none" />
            <span className="absolute top-1.5 text-[9px] font-mono font-bold text-white/50 pointer-events-none">
              ▲
            </span>
            <span className="absolute bottom-1.5 text-[9px] font-mono font-bold text-white/50 pointer-events-none">
              ▼
            </span>
            <span className="absolute left-2 text-[9px] font-mono font-bold text-white/50 pointer-events-none">
              ◀
            </span>
            <span className="absolute right-2 text-[9px] font-mono font-bold text-white/50 pointer-events-none">
              ▶
            </span>

            {/* Draggable Inner Thumb Stick */}
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-colors pointer-events-none ${
                joystickUi.active
                  ? joystickUi.magnitude > 0.75 || isRunToggled
                    ? 'bg-amber-400/90 border-2 border-white text-slate-950'
                    : 'bg-sky-400/90 border-2 border-white text-slate-950'
                  : 'bg-white/75 border border-white text-slate-900'
              }`}
              style={{
                transform: `translate3d(${joystickUi.offsetX}px, ${joystickUi.offsetY}px, 0)`,
              }}
            >
              <Compass className="w-5 h-5 opacity-80" />
            </div>
          </div>

          {/* RIGHT: Ergonomic 5-Button Action Pad (JUMP, RUN, INTERACT, TALK, ACTION) */}
          <div
            className="absolute bottom-14 right-4 sm:bottom-16 sm:right-6 z-20 flex flex-col items-end gap-2.5 pointer-events-auto select-none"
            style={{ touchAction: 'none' }}
          >
            {/* Top Row: TALK (NPC/Patient) & INTERACT (Lab Equipment) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerTalkNpc}
                className={`min-w-[54px] h-12 px-3 rounded-2xl backdrop-blur-md border font-mono text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-90 transition ${
                  nearbyTarget?.type === 'npc'
                    ? 'bg-amber-400 text-slate-950 border-white animate-pulse'
                    : 'bg-slate-900/75 text-amber-200 border-amber-400/50 hover:bg-slate-800'
                }`}
                title="Bicara dengan Dosen / Dokter / Analis / Pasien 3D Terdekat"
              >
                <MessageSquare className="w-4 h-4" />
                <span>TALK</span>
              </button>

              <button
                type="button"
                onClick={triggerInteract}
                className={`min-w-[60px] h-12 px-3 rounded-2xl backdrop-blur-md border font-mono text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-90 transition ${
                  nearbyTarget?.type === 'equipment'
                    ? 'bg-sky-400 text-slate-950 border-white animate-pulse'
                    : 'bg-slate-900/75 text-sky-200 border-sky-400/50 hover:bg-slate-800'
                }`}
                title="Inspeksi Alat Laboratorium 3D Terdekat"
              >
                <Hand className="w-4 h-4" />
                <span>INTERACT</span>
              </button>
            </div>

            {/* Bottom Row: ACTION (Scan), RUN (Sprint Toggle), JUMP (Primary Jump) */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={triggerSpecialAction}
                className="w-12 h-12 rounded-full bg-indigo-600/80 hover:bg-indigo-500 backdrop-blur-md border border-indigo-300/60 text-white font-mono text-[9px] font-bold flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-90 transition"
                title="Aksi Khusus Pemindaian Laboratorium Hematologi"
              >
                <Zap className="w-4 h-4 text-indigo-200" />
                <span>ACTION</span>
              </button>

              <button
                type="button"
                onClick={handleToggleRun}
                className={`w-13 h-13 min-w-[52px] min-h-[52px] rounded-full backdrop-blur-md border-2 font-mono text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-90 transition ${
                  isRunToggled
                    ? 'bg-emerald-500 text-slate-950 border-white'
                    : 'bg-slate-900/75 text-emerald-300 border-emerald-400/50 hover:bg-slate-800'
                }`}
                title="Aktifkan / Nonaktifkan Lari Cepat (Sprint)"
              >
                <Footprints className="w-4 h-4" />
                <span>RUN</span>
              </button>

              <button
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleJumpAction();
                }}
                onClick={handleJumpAction}
                className="w-16 h-16 rounded-full bg-sky-500/90 hover:bg-sky-400 active:bg-sky-300 backdrop-blur-md border-2 border-white text-slate-950 font-mono text-xs font-extrabold flex flex-col items-center justify-center gap-0.5 shadow-2xl active:scale-90 transition"
                title="Lompat (Jump)"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                <span>JUMP</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Interactive 3D Lab Equipment Modal */}
      {selectedEquipment && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
                  {selectedEquipment.category} • PDF Hal. {selectedEquipment.pdfPageRef}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {selectedEquipment.indonesianName}
                </h3>
                <p className="text-xs text-slate-500">{selectedEquipment.name}</p>
              </div>
              <button
                type="button"
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
                <p className="text-slate-600 leading-relaxed">
                  {selectedEquipment.operatingPrinciple}
                </p>
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
              <div className="flex flex-wrap gap-2">
                {onOpenCalculator && (
                  <button
                    type="button"
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
                    type="button"
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
                type="button"
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
      {activeNpc &&
        (() => {
          const voiceProfile = getCharacterVoiceProfile(activeNpc.id);
          const currentText =
            dialogueLang === 'id'
              ? activeNpc.dialogues[npcDialogueIndex]?.id || ''
              : activeNpc.dialogues[npcDialogueIndex]?.en || '';
          const activeEmotion =
            speakingState.isSpeaking && speakingState.characterId === activeNpc.id && speakingState.emotion
              ? speakingState.emotion
              : detectDialogueEmotion(currentText, voiceProfile);
          const emotionInfo = EMOTION_PROSODY_MAP[activeEmotion];
          const isThisSpeaking =
            speakingState.isSpeaking && speakingState.characterId === activeNpc.id;

          return (
            <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[94%] max-h-[75vh] overflow-y-auto bg-[#243b55]/95 backdrop-blur-md border border-sky-300/50 rounded-2xl p-4 sm:p-5 text-white shadow-2xl pointer-events-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    {activeNpc.role === 'patient'
                      ? `REKAM KLINIS PASIEN 3D • ${activeNpc.patientClinicalCard?.rmNumber || ''}`
                      : `${activeNpc.zone} • ${activeNpc.dialogues[npcDialogueIndex]?.topic}`}
                  </span>
                  <h4 className="text-base md:text-lg font-bold text-white mt-0.5">
                    {activeNpc.name}
                  </h4>
                  <p className="text-xs text-sky-200">{activeNpc.title}</p>

                  {/* Character Voice Identity & Emotional Prosody Badge */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-900/75 border border-sky-400/40 text-sky-200">
                      {voiceProfile.gender === 'female' ? 'Suara Wanita' : 'Suara Pria'} •{' '}
                      {voiceProfile.voiceId}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded font-bold text-slate-950"
                      style={{ backgroundColor: emotionInfo.badgeColor }}
                    >
                      Ekspresi: {activeEmotion} ({emotionInfo.labelId})
                    </span>
                    {isThisSpeaking && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Berbicara (Lip-Sync 3D Aktif)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDialogueLang(dialogueLang === 'id' ? 'en' : 'id')}
                    className="px-2.5 py-1 rounded bg-[#314d6d] hover:bg-[#3c5d82] text-xs font-mono text-sky-200 border border-[#4a6c94]"
                  >
                    {dialogueLang === 'id' ? 'ID → EN' : 'EN → ID'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await soundManager.unlockAudioEngine(false);
                      if (isThisSpeaking) {
                        soundManager.stopSpeaking();
                      } else {
                        soundManager.speakCharacterDialogue({
                          text: currentText,
                          characterId: activeNpc.id,
                          characterName: activeNpc.name,
                          lang: dialogueLang === 'id' ? 'id-ID' : 'en-US',
                        });
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 border transition ${
                      isThisSpeaking
                        ? 'bg-amber-400 text-slate-950 border-white'
                        : 'bg-sky-500/30 hover:bg-sky-500/50 text-sky-100 border-sky-400/50'
                    }`}
                    title={isThisSpeaking ? 'Hentikan Suara Karakter' : 'Putar Suara Karakter'}
                  >
                    {isThisSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> Suara
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.stopSpeaking();
                      setActiveNpc(null);
                    }}
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
                      <p className="mt-0.5 leading-relaxed">
                        {activeNpc.patientClinicalCard.anamnesis}
                      </p>
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
                        <strong>Apusan Darah Tepi:</strong>{' '}
                        {activeNpc.patientClinicalCard.smearMorphology}
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
                “{currentText}”
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-300 font-mono">
                  Dialog {npcDialogueIndex + 1} / {activeNpc.dialogues.length} •{' '}
                  {voiceProfile.voiceStyle}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNpcDialogueIndex((prev) => (prev + 1) % activeNpc.dialogues.length)
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
                  >
                    Dialog Berikutnya →
                  </button>
                  {onStartQuiz && (
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.stopSpeaking();
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
          );
        })()}

      {/* Collapsible Bottom Control Dock (Quick Access to 6 3D Patients & 10 Lab Instruments) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 w-[96%] max-w-4xl bg-[#243b55]/90 backdrop-blur-md border border-[#45678e] rounded-xl px-3.5 py-2 text-white shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] sm:text-xs min-w-0">
            <span className="font-mono text-sky-300 font-semibold flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              {showMobileHud
                ? 'JOYSTICK KIRI: Gerak 360° • GESER LAYAR: Kamera 3D • TOMBOL KANAN: Aksi'
                : 'WASD/Panah: Jalan • Shift: Lari • Space: Lompat • E: Interaksi • Geser: Kamera'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="text-[11px] sm:text-xs text-sky-200 hover:text-white flex items-center gap-1 font-mono shrink-0 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-sky-400/30"
          >
            {dockCollapsed ? (
              <>
                Daftar Pasien & Alat 3D <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Tutup <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {!dockCollapsed && (
          <div className="mt-2.5 pt-2.5 border-t border-[#3a5778] space-y-2 max-h-40 overflow-y-auto">
            {/* Row 1: Direct Clickable 6 Clinical Patients in 3D */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-amber-300 mr-1">
                6 PASIEN 3D:
              </span>
              {HOSPITAL_NPCS.filter((n) => n.role === 'patient').map((pat) => (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => {
                    soundManager.playNpcInteract();
                    teleportToZone(pat.position[0], pat.position[2] + 1.8, pat.zone);
                    setActiveNpc(pat);
                    setNpcDialogueIndex(0);
                    setSelectedEquipment(null);
                    setDockCollapsed(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/35 border border-amber-300/50 text-[11px] font-semibold text-amber-100 flex items-center gap-1 transition"
                >
                  <UserCheck className="w-3 h-3 text-amber-300" />
                  {pat.name}
                </button>
              ))}
            </div>

            {/* Row 2: Lab Equipment & Medical Staff Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-sky-300 mr-1">
                  10 ALAT LAB 3D:
                </span>
                {LAB_EQUIPMENT_3D_ITEMS.map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      teleportToZone(
                        eq.position[0],
                        eq.position[2] + 1.8,
                        'Laboratorium Hematologi Futuristik'
                      );
                      setSelectedEquipment(eq);
                      setActiveNpc(null);
                      setDockCollapsed(true);
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
