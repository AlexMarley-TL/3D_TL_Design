import { Environment, ContactShadows, OrbitControls, Center } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { TrophyModel } from './TrophyModel.tsx'
import type { MetalPreset } from '../types/index.ts'

interface TrophySceneProps {
  modelPath: string
  metalPreset: MetalPreset
  useOriginalMaterials?: boolean
}

export function TrophyScene({ modelPath, metalPreset, useOriginalMaterials }: TrophySceneProps) {
  return (
    <>
      <Environment files="/hdri/studio_small_09_2k.hdr" />

      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.4}
        blur={2.5}
        scale={10}
        resolution={256}
        far={1}
        color="#000000"
      />

      <Center>
        <TrophyModel path={modelPath} preset={metalPreset} useOriginalMaterials={useOriginalMaterials} />
      </Center>

      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={1.5}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.3}
          intensity={0.3}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  )
}
