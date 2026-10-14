import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"
import { FastForward, Play } from "lucide-react"
import { Button } from "../ui/button"

export default function Mood() {
    const mountRef = useRef<HTMLDivElement>(null)
    const [animationState, setAnimationState] = useState<"Walk" | "Run">("Walk")
    const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null)
    const [animationClips, setAnimationClips] = useState<THREE.AnimationClip[]>([])

    const addGround = async (scene: THREE.Scene) => {
        const loader = new THREE.TextureLoader()
        const texture = await loader.loadAsync("/assets/moods/cobblestone_03_disp_1k.png")
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(10, 10)

        const groundMaterial = new THREE.MeshBasicMaterial({ map: texture })
        const groundGeometry = new THREE.PlaneGeometry(10, 10)
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        scene.add(ground)
        return texture
    }

    const addCat = async (scene: THREE.Scene) => {
        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync("/assets/moods/cat_long_haired.glb")
        const model = gltf.scene
        model.scale.set(0.5, 0.5, 0.5)
        model.lookAt(-1, 0, 0)
        model.position.set(0, 0, 0)
        scene.add(model)

        const mixer = new THREE.AnimationMixer(model)
        gltf.animations.forEach((clip) => {
            if (clip.name.includes(animationState)) {
                const action = mixer.clipAction(clip)
                action.setLoop(THREE.LoopRepeat, Infinity)
                action.play()
            }
        })

        setMixer(mixer)
        setAnimationClips(gltf.animations)

        return mixer
    }

    useEffect(() => {
        let renderer: THREE.WebGLRenderer
        let frameId: number
        let camera: THREE.PerspectiveCamera

        const run = async () => {
            const clock = new THREE.Clock()
            const width = mountRef.current?.clientWidth || 400
            const height = width * 0.5

            // Scene setup
            const scene = new THREE.Scene()

            camera = new THREE.PerspectiveCamera(45, width / height, 0.25, 20)
            camera.position.set(0, 0, 5)
            camera.lookAt(0, 1, 0)

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
            renderer.setSize(width, height)
            renderer.outputColorSpace = THREE.SRGBColorSpace
            renderer.toneMapping = THREE.ACESFilmicToneMapping
            renderer.toneMappingExposure = 1.0
            if (mountRef.current) {
                mountRef.current.appendChild(renderer.domElement)
            }

            const pmrem = new THREE.PMREMGenerator(renderer)
            await new Promise<void>((resolve) => {
                new RGBELoader().load("/assets/moods/studio_small_09_4k.hdr", (hdr) => {
                    const envMap = pmrem.fromEquirectangular(hdr).texture
                    scene.environment = envMap
                    hdr.dispose()
                    pmrem.dispose()
                    resolve()
                })
            })

            scene.add(new THREE.AmbientLight(0xffffff, 1.0))
            const dirLight = new THREE.DirectionalLight(0xffffff, 3)
            dirLight.position.set(10, 10, 10)
            scene.add(dirLight)

            const groundTexture = await addGround(scene)
            const mixer = await addCat(scene)

            // Controls
            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true
            controls.dampingFactor = 0.05
            controls.enableZoom = false
            controls.maxPolarAngle = Math.PI / 2
            controls.minPolarAngle = Math.PI / 2
            controls.target.set(0, 1.5, 0)
            controls.update()

            const animate = () => {
                controls.update()
                groundTexture.offset.x -= 0.01
                if (groundTexture.offset.x < -1000) groundTexture.offset.x = 0

                mixer.update(clock.getDelta())
                renderer.render(scene, camera)
                frameId = requestAnimationFrame(animate)
            }
            animate()
        }

        run()

        return () => {
            cancelAnimationFrame(frameId)
            if (renderer) {
                renderer.dispose()
                if (mountRef.current) mountRef.current.removeChild(renderer.domElement)
            }
        }
    }, [])

    useEffect(() => {
        if (mixer) {
            mixer.stopAllAction()

            animationClips.map((clip: THREE.AnimationClip) => {
                const action = mixer.clipAction(clip)
                if (action.getClip().name.includes(animationState)) {
                    action.setLoop(THREE.LoopRepeat, Infinity)
                    action.play()
                } else {
                    action.stop()
                }
            })
        }
    }, [animationState])

    return (
        <div className="flex flex-col items-center relative">
            <div ref={mountRef} className="w-full aspect-[2/1] rounded-2xl overflow-hidden" />
            <Button
                variant="outline"
                colorTheme="primary"
                className="absolute top-2 right-2"
                onClick={() => setAnimationState(animationState === "Walk" ? "Run" : "Walk")}
            >
                {animationState === "Walk" ? <Play /> : <FastForward />}
            </Button>
            <div className="text-center text-xs text-muted-foreground mt-2">
                <p>Three.js Demo</p>
                <p>July 25, 2025</p>
            </div>
        </div>
    )
}
