import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas=document.getElementById('webglCanvas');
const source=document.getElementById('sourceIcon');
const loader=document.getElementById('loader');
const state=document.getElementById('state');

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x020205,.016);

const camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,.005,500
);

camera.position.set(0,2,32);

const renderer=new THREE.WebGLRenderer({
    canvas,
    antialias:true,
    alpha:true,
    powerPreference:'high-performance'
});

renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;

const controls=new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping=true;
controls.dampingFactor=.035;
controls.enablePan=false;
controls.enableZoom=true;
controls.enableRotate=true;
controls.minDistance=.01;
controls.maxDistance=100;
controls.zoomToCursor=false;
controls.autoRotate=false;
controls.minPolarAngle=0;
controls.maxPolarAngle=Math.PI;
controls.minAzimuthAngle=-Infinity;
controls.maxAzimuthAngle=Infinity;
controls.target.set(0,0,0);

const composer=new EffectComposer(renderer);

composer.addPass(
    new RenderPass(scene,camera)
);

const bloom=new UnrealBloomPass(
    new THREE.Vector2(
        innerWidth,
        innerHeight
    ),
    .82,
    .38,
    .2
);

composer.addPass(bloom);

const universe=new THREE.Group();
scene.add(universe);

const coreGroup=new THREE.Group();
universe.add(coreGroup);

const orbitGroup=new THREE.Group();
universe.add(orbitGroup);

const decorationGroup=new THREE.Group();
universe.add(decorationGroup);

const clock=new THREE.Clock();

function particleTexture(){
    const c=document.createElement('canvas');
    c.width=c.height=64;

    const ctx=c.getContext('2d');

    const g=ctx.createRadialGradient(
        32,32,0,
        32,32,32
    );

    g.addColorStop(
        0,
        'rgba(255,255,255,1)'
    );

    g.addColorStop(
        .16,
        'rgba(255,255,255,.95)'
    );

    g.addColorStop(
        .42,
        'rgba(255,255,255,.35)'
    );

    g.addColorStop(
        1,
        'rgba(255,255,255,0)'
    );

    ctx.fillStyle=g;
    ctx.fillRect(0,0,64,64);

    return new THREE.CanvasTexture(c);
}

const pointTexture=particleTexture();

function makeMaterial(size=.08,opacity=.9){
    return new THREE.PointsMaterial({
        size,
        map:pointTexture,
        vertexColors:true,
        transparent:true,
        opacity,
        depthWrite:false,
        depthTest:true,
        blending:THREE.AdditiveBlending,
        sizeAttenuation:true
    });
}

/* ==================================================
   TRUE SPHERICAL GALAXY CORE
================================================== */

function createGalaxySphere(){
    const count=52000;
    const radius=5.25;

    const positions=
        new Float32Array(count*3);

    const colors=
        new Float32Array(count*3);

    const color=
        new THREE.Color();

    for(let i=0;i<count;i++){
        const i3=i*3;

        /*
         * Uniform 3D sphere volume.
         */

        const r=
            radius*
            Math.cbrt(
                Math.random()
            );

        const theta=
            Math.random()*
            Math.PI*2;

        const u=
            Math.random()*2-1;

        const f=
            Math.sqrt(
                1-u*u
            );

        let x=
            r*f*
            Math.cos(theta);

        let y=
            r*u;

        let z=
            r*f*
            Math.sin(theta);

        /*
         * Very subtle internal movement in the
         * particle distribution without destroying
         * the spherical shape.
         */

        const distortion=
            Math.sin(
                theta*3+
                r*.7
            )*.035;

        x+=
            distortion*
            Math.cos(theta);

        z+=
            distortion*
            Math.sin(theta);

        positions[i3]=x;
        positions[i3+1]=y;
        positions[i3+2]=z;

        /*
         * PURE SATURATED BLUE.
         *
         * IMPORTANT:
         * Lightness stays low enough that particles
         * cannot become white/silver.
         *
         * Hue is fixed so there is no cyan,
         * violet or gray variation.
         */

        color.setHSL(
            .655,
            1.0,
            .48+
            Math.random()*.035
        );

        colors[i3]=color.r;
        colors[i3+1]=color.g;
        colors[i3+2]=color.b;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,
            3
        )
    );

    const sphere=
        new THREE.Points(
            geometry,
            makeMaterial(
                .052,
                .98
            )
        );

    sphere.name='pureBlueSphere';

    coreGroup.add(sphere);

    createSphereShell(radius);
    createGalaxySpiral();
}

function createSphereShell(radius){
    /*
     * DENSE PURE BLUE SURFACE.
     *
     * This gives the sphere a strong blue silhouette
     * while keeping individual particles visible.
     */

    const count=28000;

    const positions=
        new Float32Array(count*3);

    const colors=
        new Float32Array(count*3);

    const color=
        new THREE.Color();

    for(let i=0;i<count;i++){
        const i3=i*3;

        const theta=
            Math.random()*
            Math.PI*2;

        const u=
            Math.random()*2-1;

        const f=
            Math.sqrt(
                1-u*u
            );

        /*
         * Extremely thin shell.
         * This creates the condensed sphere edge.
         */

        const r=
            radius+
            (Math.random()-.5)*
            .035;

        positions[i3]=
            r*f*
            Math.cos(theta);

        positions[i3+1]=
            r*u;

        positions[i3+2]=
            r*f*
            Math.sin(theta);

        /*
         * EXACT SAME PURE BLUE FAMILY.
         *
         * No random hue.
         * No cyan.
         * No violet.
         * No near-white lightness.
         */

        color.setHSL(
            .655,
            1.0,
            .51+
            Math.random()*.025
        );

        colors[i3]=color.r;
        colors[i3+1]=color.g;
        colors[i3+2]=color.b;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,
            3
        )
    );

    const shell=
        new THREE.Points(
            geometry,
            makeMaterial(
                .044,
                .98
            )
        );

    shell.name='pureBlueShell';

    coreGroup.add(shell);
}
function createGalaxySpiral(){
    /*
     * MARVILLVERSE GOLD ENERGY CORE
     *
     * NO spiral.
     * NO disk.
     *
     * Structure:
     * - dense spherical nucleus
     * - irregular 3D energy filaments
     * - small floating golden clusters
     */

    const nucleusCount=11500;
    const filamentCount=14500;
    const clusterCount=4500;
    const total=
        nucleusCount+
        filamentCount+
        clusterCount;

    const positions=
        new Float32Array(total*3);

    const colors=
        new Float32Array(total*3);

    const color=
        new THREE.Color();

    let index=0;

    function setGold(i3,intensity=0){
        color.setHSL(
            .115+
            (Math.random()-.5)*.012,
            .96,
            Math.min(
                .84,
                .48+
                intensity*.22+
                Math.random()*.13
            )
        );

        colors[i3]=color.r;
        colors[i3+1]=color.g;
        colors[i3+2]=color.b;
    }

    /*
     * ==========================================
     * DENSE SPHERICAL GOLD NUCLEUS
     * ==========================================
     */

    for(let i=0;i<nucleusCount;i++){
        const i3=index*3;

        const r=
            1.65*
            Math.pow(
                Math.random(),
                1.65
            );

        const theta=
            Math.random()*
            Math.PI*2;

        const u=
            Math.random()*2-1;

        const f=
            Math.sqrt(
                1-u*u
            );

        positions[i3]=
            r*f*
            Math.cos(theta);

        positions[i3+1]=
            r*u;

        positions[i3+2]=
            r*f*
            Math.sin(theta);

        setGold(
            i3,
            1-r/1.65
        );

        index++;
    }

    /*
     * ==========================================
     * 3D ENERGY FILAMENTS
     * ==========================================
     *
     * Several independent curved branches grow
     * outward from the nucleus in random XYZ
     * directions.
     */

    const branches=22;

    const branchData=[];

    for(let b=0;b<branches;b++){
        const direction=
            new THREE.Vector3(
                Math.random()*2-1,
                Math.random()*2-1,
                Math.random()*2-1
            ).normalize();

        const bendA=
            new THREE.Vector3(
                Math.random()*2-1,
                Math.random()*2-1,
                Math.random()*2-1
            ).normalize();

        const bendB=
            new THREE.Vector3(
                Math.random()*2-1,
                Math.random()*2-1,
                Math.random()*2-1
            ).normalize();

        branchData.push({
            direction,
            bendA,
            bendB,
            length:
                2.5+
                Math.random()*2.1
        });
    }

    for(let i=0;i<filamentCount;i++){
        const i3=index*3;

        const branch=
            branchData[
                i%branches
            ];

        const t=
            Math.pow(
                Math.random(),
                .72
            );

        /*
         * Main branch grows away from center.
         */

        const distance=
            .65+
            t*branch.length;

        const point=
            branch.direction
            .clone()
            .multiplyScalar(distance);

        /*
         * Organic bends.
         */

        point.add(
            branch.bendA
            .clone()
            .multiplyScalar(
                Math.sin(
                    t*Math.PI
                )*.62
            )
        );

        point.add(
            branch.bendB
            .clone()
            .multiplyScalar(
                Math.sin(
                    t*Math.PI*2
                )*.28
            )
        );

        /*
         * Tight particle radius around each
         * filament so they look condensed.
         */

        const spread=
            .035+
            t*.085;

        point.x+=
            (Math.random()-.5)*
            spread;

        point.y+=
            (Math.random()-.5)*
            spread;

        point.z+=
            (Math.random()-.5)*
            spread;

        positions[i3]=point.x;
        positions[i3+1]=point.y;
        positions[i3+2]=point.z;

        setGold(
            i3,
            1-t*.55
        );

        index++;
    }

    /*
     * ==========================================
     * FLOATING GOLD ENERGY CLUSTERS
     * ==========================================
     */

    const clusterCenters=[];

    for(let c=0;c<14;c++){
        const direction=
            new THREE.Vector3(
                Math.random()*2-1,
                Math.random()*2-1,
                Math.random()*2-1
            ).normalize();

        direction.multiplyScalar(
            2+
            Math.random()*2.5
        );

        clusterCenters.push(
            direction
        );
    }

    for(let i=0;i<clusterCount;i++){
        const i3=index*3;

        const center=
            clusterCenters[
                i%
                clusterCenters.length
            ];

        const radius=
            Math.pow(
                Math.random(),
                2
            )*.38;

        const theta=
            Math.random()*
            Math.PI*2;

        const u=
            Math.random()*2-1;

        const f=
            Math.sqrt(
                1-u*u
            );

        positions[i3]=
            center.x+
            radius*f*
            Math.cos(theta);

        positions[i3+1]=
            center.y+
            radius*u;

        positions[i3+2]=
            center.z+
            radius*f*
            Math.sin(theta);

        setGold(
            i3,
            .55
        );

        index++;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,
            3
        )
    );

    const core=
        new THREE.Points(
            geometry,
            makeMaterial(
                .058,
                .98
            )
        );

    core.name='goldGalaxy';

    coreGroup.add(core);
}
/* ==================================================
   REAL 3D ORBITAL RINGS
================================================== */

function createOrbit(
    radius,
    thickness,
    count,
    orbitColor
){
    /*
     * SINGLE-COLOR SOLAR ORBIT
     *
     * Every particle belonging to this orbit uses
     * exactly the same RGB color.
     *
     * No gradients.
     * No blue.
     */

    const positions=
        new Float32Array(count*3);

    const colors=
        new Float32Array(count*3);

    const color=
        new THREE.Color(
            orbitColor
        );

    for(let i=0;i<count;i++){
        const i3=i*3;

        const angle=
            Math.random()*
            Math.PI*2;

        const radial=
            (Math.random()-.5)*
            thickness*.10;

        const vertical=
            (Math.random()-.5)*
            thickness*.045;

        const r=
            radius+
            radial;

        /*
         * Every orbit exists in the exact
         * same XZ solar-system plane.
         */

        positions[i3]=
            Math.cos(angle)*
            r;

        positions[i3+1]=
            vertical;

        positions[i3+2]=
            Math.sin(angle)*
            r;

        colors[i3]=color.r;
        colors[i3+1]=color.g;
        colors[i3+2]=color.b;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,
            3
        )
    );

    const orbit=
        new THREE.Points(
            geometry,
            makeMaterial(
                .054,
                .32
            )
        );

    orbit.rotation.set(
        0,
        0,
        0
    );

    orbitGroup.add(orbit);

    return orbit;
}
function createOrbits(){
    /*
     * NINE MARVILLVERSE ORBITS
     *
     * All rings:
     * - share one center
     * - share one plane
     * - have unique colors
     * - contain NO blue orbit
     */

    const orbits=[
        {
            radius:6.6,
            thickness:.15,
            count:8500,
            color:0xffd84d
        },
        {
            radius:8.575,
            thickness:.145,
            count:8200,
            color:0xff9f1c
        },
        {
            radius:10.485,
            thickness:.14,
            count:7900,
            color:0xff493d
        },
        {
            radius:12.524,
            thickness:.135,
            count:7600,
            color:0xff3dbb
        },
        {
            radius:14.693,
            thickness:.13,
            count:7300,
            color:0xb95cff
        },
        {
            radius:16.97,
            thickness:.125,
            count:7000,
            color:0xc8ff45
        },
        {
            radius:19.203,
            thickness:.12,
            count:6700,
            color:0x36f59a
        },
        {
            radius:21.264,
            thickness:.115,
            count:6400,
            color:0x28e0b8
        },
        {
            radius:23.863,
            thickness:.11,
            count:6100,
            color:0xff7a9e
        }
    ];

    for(const config of orbits){
        createOrbit(
            config.radius,
            config.thickness,
            config.count,
            config.color
        );
    }

    /*
     * Stars remain our vertical guide:
     *
     *              STAR
     *                |
     *
     *   ========= SPHERE =========
     *
     *                |
     *              STAR
     *
     * Keep the complete orbital system
     * horizontally centered.
     */

    orbitGroup.rotation.set(
        0,
        0,
        0
    );

    orbitGroup.position.set(
        0,
        0,
        0
    );
}
function createPlanet(radius,size,colorA,colorB){
    const group=new THREE.Group();

    const count=
        Math.floor(
            900+
            size*700
        );

    const positions=
        new Float32Array(
            count*3
        );

    const colors=
        new Float32Array(
            count*3
        );

    const color=
        new THREE.Color();

    for(let i=0;i<count;i++){
        const i3=i*3;

        const theta=
            Math.random()*
            Math.PI*2;

        const u=
            Math.random()*2-1;

        const f=
            Math.sqrt(1-u*u);

        const r=
            size*
            Math.cbrt(
                Math.random()
            );

        positions[i3]=
            r*f*
            Math.cos(theta);

        positions[i3+1]=
            r*u;

        positions[i3+2]=
            r*f*
            Math.sin(theta);

        color.copy(
            Math.random()<.5
                ?colorA
                :colorB
        );

        color.offsetHSL(
            (Math.random()-.5)*.04,
            0,
            (Math.random()-.5)*.18
        );

        colors[i3]=color.r;
        colors[i3+1]=color.g;
        colors[i3+2]=color.b;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,3
        )
    );

    const planet=
        new THREE.Points(
            geometry,
            makeMaterial(.09,.95)
        );

    group.add(planet);

    group.userData.radius=radius;
    group.userData.angle=
        Math.random()*
        Math.PI*2;

    group.userData.speed=
        .08+
        Math.random()*.06;

    group.userData.tilt=
        .35+
        Math.random()*.8;

    orbitGroup.add(group);

    return group;
}

const planets=[];

function createPlanets(){
    planets.push(
        createPlanet(
            10.1,
            1.2,
            new THREE.Color(
                0x7b38ff
            ),
            new THREE.Color(
                0x00ddff
            )
        )
    );

    planets.push(
        createPlanet(
            12.3,
            .72,
            new THREE.Color(
                0xff2edc
            ),
            new THREE.Color(
                0x6644ff
            )
        )
    );

    planets.push(
        createPlanet(
            8.8,
            .48,
            new THREE.Color(
                0x00eaff
            ),
            new THREE.Color(
                0xffffff
            )
        )
    );

    planets.push(
        createPlanet(
            11.2,
            .32,
            new THREE.Color(
                0xff54ef
            ),
            new THREE.Color(
                0x7755ff
            )
        )
    );
}

/* ==================================================
   TOP + BOTTOM MARVILLVERSE STAR
================================================== */


/* ==========================================================
   MARVILLVERSE ORBIT PLANETS

   One perfect 3D particle sphere for every orbit.

   These are intentionally independent from the old planet
   implementation so the working scene remains untouched.
   ========================================================== */

function createMarvillPlanet(
    orbitRadius,
    planetRadius,
    planetColor,
    angle
){
    const group=
        new THREE.Group();

    /*
     * PERFECT SPHERICAL SURFACE
     *
     * Fibonacci distribution produces an evenly distributed
     * spherical shell without random lumps.
     */

    const surfaceCount=
        Math.max(
            2400,
            Math.floor(
                planetRadius*5200
            )
        );

    const positions=
        new Float32Array(
            surfaceCount*3
        );

    const colors=
        new Float32Array(
            surfaceCount*3
        );

    const base=
        new THREE.Color(
            planetColor
        );

    const color=
        new THREE.Color();

    const goldenAngle=
        Math.PI*
        (3-Math.sqrt(5));

    for(let i=0;i<surfaceCount;i++){
        const i3=i*3;

        const y=
            1-
            (i/(surfaceCount-1))*2;

        const ring=
            Math.sqrt(
                Math.max(
                    0,
                    1-y*y
                )
            );

        const theta=
            goldenAngle*i;

        positions[i3]=
            Math.cos(theta)*
            ring*
            planetRadius;

        positions[i3+1]=
            y*
            planetRadius;

        positions[i3+2]=
            Math.sin(theta)*
            ring*
            planetRadius;

        /*
         * Same color as its orbit.
         * Only a small brightness difference gives the
         * sphere visible 3D depth.
         */

        const brightness=
            .72+
            Math.random()*.28;

        color.setRGB(
            Math.min(
                1,
                base.r*brightness*1.16
            ),
            Math.min(
                1,
                base.g*brightness*1.16
            ),
            Math.min(
                1,
                base.b*brightness*1.16
            )
        );

        colors[i3]=color.r;
        colors[i3+1]=color.g;
        colors[i3+2]=color.b;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,
            3
        )
    );

    const surface=
        new THREE.Points(
            geometry,
            makeMaterial(
                .052,
                1
            )
        );

    group.add(surface);

    /*
     * SMALL DENSE INTERIOR
     *
     * Makes the planet look solid rather than like
     * an empty wire sphere.
     */

    const innerCount=
        Math.max(
            700,
            Math.floor(
                planetRadius*1600
            )
        );

    const innerPositions=
        new Float32Array(
            innerCount*3
        );

    const innerColors=
        new Float32Array(
            innerCount*3
        );

    for(let i=0;i<innerCount;i++){
        const i3=i*3;

        const theta=
            Math.random()*
            Math.PI*2;

        const u=
            Math.random()*2-1;

        const f=
            Math.sqrt(
                1-u*u
            );

        const r=
            planetRadius*
            .88*
            Math.cbrt(
                Math.random()
            );

        innerPositions[i3]=
            r*f*
            Math.cos(theta);

        innerPositions[i3+1]=
            r*u;

        innerPositions[i3+2]=
            r*f*
            Math.sin(theta);

        innerColors[i3]=base.r;
        innerColors[i3+1]=base.g;
        innerColors[i3+2]=base.b;
    }

    const innerGeometry=
        new THREE.BufferGeometry();

    innerGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            innerPositions,
            3
        )
    );

    innerGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            innerColors,
            3
        )
    );

    const interior=
        new THREE.Points(
            innerGeometry,
            makeMaterial(
                .037,
                .65
            )
        );

    group.add(interior);

    /*
     * Position EXACTLY on its corresponding orbit.
     *
     * Since the working orbits are in the XZ plane,
     * Y remains exactly zero.
     */

    group.position.set(
        Math.cos(angle)*orbitRadius,
        0,
        Math.sin(angle)*orbitRadius
    );

    /*
     * Add to orbitGroup.
     *
     * Therefore planets automatically inherit the exact
     * same orientation and center as all nine orbit rings.
     */

    orbitGroup.add(group);
    group.userData.isMarvillPlanet=true;
    group.userData.orbitRadius=orbitRadius;
    group.userData.planetRadius=planetRadius;
    group.userData.planetColor=planetColor;

    /*
     * Randomly place this planet above or below
     * its orbital plane.
     */
    /* MARVILL_EXACT_ORBIT_POSITION */

    /*
     * Planet center sits EXACTLY on its circular orbit.
     *
     * X/Z are calculated from the planet's own orbitRadius.
     * Y remains zero.
     *
     * No visual child displacement is used.
     */
    group.position.set(
        Math.cos(angle)*orbitRadius,
        0,
        Math.sin(angle)*orbitRadius
    );

    group.userData.angle=angle;
    group.userData.radius=orbitRadius;

    return group;
}

function createMarvillPlanets(){
    /*
     * EXACT SAME RADII + COLORS AS THE WORKING
     * NINE-ORBIT CONFIGURATION.
     *
     * Different angles spread the planets naturally
     * around the system.
     *
     * Later these nine planets can become the
     * MarvillVerse software/tool icons.
     */

    const planets=[
        {
            orbit:6.6,
            size:0.731,
            color:0xffd84d,
            angle:0.38
        },
        {
            orbit:8.575,
            size:0.924,
            color:0xff9f1c,
            angle:2.74
        },
        {
            orbit:10.485,
            size:0.666,
            color:0xff493d,
            angle:5.31
        },
        {
            orbit:12.524,
            size:1.053,
            color:0xff3dbb,
            angle:1.46
        },
        {
            orbit:14.693,
            size:0.796,
            color:0xb95cff,
            angle:4.18
        },
        {
            orbit:16.97,
            size:1.161,
            color:0xc8ff45,
            angle:0.96
        },
        {
            orbit:19.203,
            size:0.752,
            color:0x36f59a,
            angle:3.57
        },
        {
            orbit:21.264,
            size:0.989,
            color:0x28e0b8,
            angle:5.86
        },
        {
            orbit:23.863,
            size:1.29,
            color:0xff7a9e,
            angle:2.13
        }
    ];

    for(const planet of planets){
        createMarvillPlanet(
            planet.orbit,
            planet.size,
            planet.color,
            planet.angle
        );
    }
}
function createParticleStar(y,scale){
    /*
     * TRUE 3D SIX-POINT CRYSTAL
     *
     * X = left/right points
     * Y = long top/bottom points
     * Z = front/back points
     *
     * Unlike the previous flat star, this is a genuine
     * 3D volume and stays recognizable from the side.
     */

    const count=11500;

    const positions=
        new Float32Array(count*3);

    const colors=
        new Float32Array(count*3);

    const color=
        new THREE.Color();

    let created=0;

    const width=scale*2.05;
    const height=scale*3.25;

    /*
     * Give Z substantial depth.
     * This is what prevents the side view becoming a line.
     */
    const depth=scale*2.05;

    while(created<count){
        const x=
            (Math.random()*2-1)*
            width;

        const py=
            (Math.random()*2-1)*
            height;

        const z=
            (Math.random()*2-1)*
            depth;

        /*
         * Octahedral/star volume:
         *
         *        +Y
         *         |
         *   -X ---+--- +X
         *        / \
         *      -Z   +Z
         *         |
         *        -Y
         *
         * Exponents below 1 pinch the faces inward,
         * producing the sharp MarvillVerse-style points.
         */

        const nx=
            Math.abs(x)/width;

        const ny=
            Math.abs(py)/height;

        const nz=
            Math.abs(z)/depth;

        const shape=
            Math.pow(nx,.48)+
            Math.pow(ny,.48)+
            Math.pow(nz,.48);

        if(shape>1)
            continue;

        const i3=created*3;

        /*
         * Tiny jitter prevents perfectly mechanical
         * particle rows while preserving the shape.
         */

        positions[i3]=
            x+
            (Math.random()-.5)*.018;

        positions[i3+1]=
            y+
            py+
            (Math.random()-.5)*.018;

        positions[i3+2]=
            z+
            (Math.random()-.5)*.018;

        /*
         * Keep the requested BLUE identity.
         * Slight lightness variation reveals the 3D
         * surfaces when the camera rotates.
         */

        const radial=
            Math.min(
                1,
                Math.sqrt(
                    nx*nx+
                    ny*ny+
                    nz*nz
                )
            );

        const light=
            .52+
            (1-radial)*.22+
            Math.random()*.1;

        color.setHSL(
            .615+
            (Math.random()-.5)*.012,
            .98,
            Math.min(.82,light)
        );

        colors[i3]=color.r;
        colors[i3+1]=color.g;
        colors[i3+2]=color.b;

        created++;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,
            3
        )
    );

    const star=
        new THREE.Points(
            geometry,
            makeMaterial(
                .052,
                .97
            )
        );

    /*
     * Give every star a tiny rotational offset so its
     * front/back crystalline points are visible even
     * from the initial camera angle.
     */
    star.rotation.y=.08;
    star.rotation.x=.025;

    decorationGroup.add(star);
}
/* ==================================================
   STAR FIELD
================================================== */

function createStars(){
    const count=5000;

    const positions=
        new Float32Array(
            count*3
        );

    const colors=
        new Float32Array(
            count*3
        );

    for(let i=0;i<count;i++){
        const i3=i*3;

        const r=
            50+
            Math.random()*130;

        const theta=
            Math.random()*
            Math.PI*2;

        const u=
            Math.random()*2-1;

        const f=
            Math.sqrt(1-u*u);

        positions[i3]=
            r*f*
            Math.cos(theta);

        positions[i3+1]=
            r*u;

        positions[i3+2]=
            r*f*
            Math.sin(theta);

        const b=
            .25+
            Math.random()*.45;

        colors[i3]=b*.65;
        colors[i3+1]=b*.7;
        colors[i3+2]=b;
    }

    const geometry=
        new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions,3
        )
    );

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            colors,3
        )
    );

    const stars=
        new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size:.055,
                vertexColors:true,
                transparent:true,
                opacity:.6,
                depthWrite:false
            })
        );

    stars.name='stars';

    scene.add(stars);
}

/* ==================================================
   ANIMATION
================================================== */


/* ==========================================================
   MARVILLVERSE PLANET FOCUS SYSTEM

   Click planet:
   - detect its particle sphere
   - smoothly move camera toward it
   - smoothly move OrbitControls target to it

   Click empty space:
   - return to the complete universe view
   ========================================================== */

const planetRaycaster=
    new THREE.Raycaster();

const planetPointer=
    new THREE.Vector2();

planetRaycaster.params.Points.threshold=.55;


const planetFocusClock=
    new THREE.Clock();
const planetFocus={
    active:false,
    progress:1,
    duration:1.05,

    startCamera:
        new THREE.Vector3(),

    targetCamera:
        new THREE.Vector3(),

    startTarget:
        new THREE.Vector3(),

    targetTarget:
        new THREE.Vector3(),

    homeCamera:
        camera.position.clone(),

    homeTarget:
        controls.target.clone(),

    planet:null
};

function getMarvillPlanets(){
    return orbitGroup.children.filter(
        child=>
            child.isGroup &&
            child.userData.isMarvillPlanet
    );
}


function setOrbitVisibility(visible){
    /*
     * orbitGroup contains both:
     * - orbit lines = direct THREE.Points children
     * - Marvill planets = THREE.Group children
     *
     * Hide ONLY the orbit lines.
     * Planets stay visible.
     */
    for(const child of orbitGroup.children){
        if(
            child.isPoints &&
            !child.userData.isMarvillPlanet
        ){
            child.visible=visible;
        }
    }
}

function setPlanetVisibility(selectedPlanet){
    /*
     * During focus, show only the selected planet.
     * During universe view, show all nine.
     */
    for(const planet of getMarvillPlanets()){
        planet.visible=
            !selectedPlanet ||
            planet===selectedPlanet;
    }
}
function beginPlanetFocus(
    targetPosition,
    planet=null,
    returnHome=false
){
    planetFocus.active=true;
    planetFocus.progress=0;
    planetFocus.planet=planet;

    planetFocus.startCamera.copy(
        camera.position
    );

    planetFocus.startTarget.copy(
        controls.target
    );

    /*
     * NEVER HIDE THE SOLAR SYSTEM.
     *
     * Orbits and all nine planets remain visible
     * even while one planet is focused.
     */
    setOrbitVisibility(true);
    setPlanetVisibility(null);

    if(returnHome){
        planetFocus.targetCamera.copy(
            planetFocus.homeCamera
        );

        planetFocus.targetTarget.copy(
            planetFocus.homeTarget
        );

        return;
    }

    /*
     * Selected planet becomes the EXACT
     * OrbitControls target.
     */
    planetFocus.targetTarget.copy(
        targetPosition
    );

    const planetRadius=
        planet?.userData?.planetRadius ||
        .5;

    /*
     * Preserve the current viewing direction,
     * but move MUCH closer to the selected planet.
     */
    const direction=
        new THREE.Vector3()
            .subVectors(
                camera.position,
                targetPosition
            );

    if(direction.lengthSq()<.000001){
        direction.set(
            0,
            0,
            1
        );
    }

    direction.normalize();

    /*
     * CLOSE-UP DISTANCE
     *
     * Previous:
     * planetRadius * 3.15
     *
     * New:
     * planetRadius * 1.65
     *
     * This makes the selected planet dramatically
     * larger on screen.
     */
    const distance=
        planetRadius*3.0;

    planetFocus.targetCamera
        .copy(targetPosition)
        .addScaledVector(
            direction,
            distance
        );
}
function focusPlanet(planet){
    /*
     * FLY-THROUGH MODE
     *
     * Orbit rings are visual particles only.
     * They must NEVER restrict camera travel.
     */
    controls.minDistance=.01;
    controls.maxDistance=100;
    controls.autoRotate=false;

    const worldPosition=
        new THREE.Vector3();

    planet.getWorldPosition(
        worldPosition
    );

    beginPlanetFocus(
        worldPosition,
        planet,
        false
    );
}
function returnToUniverse(){
    /*
     * Everything remains visible.
     */
    setOrbitVisibility(true);
    setPlanetVisibility(null);

    planetFocus.planet=null;

    beginPlanetFocus(
        planetFocus.homeTarget,
        null,
        true
    );
}
function updatePlanetFocus(delta){
    if(!planetFocus.active)
        return;

    planetFocus.progress+=
        delta/
        planetFocus.duration;

    const raw=
        Math.min(
            1,
            planetFocus.progress
        );

    /*
     * Smooth cubic easing.
     */

    const t=
        raw<.5
            ?4*raw*raw*raw
            :1-
                Math.pow(
                    -2*raw+2,
                    3
                )/2;

    camera.position.lerpVectors(
        planetFocus.startCamera,
        planetFocus.targetCamera,
        t
    );

    controls.target.lerpVectors(
        planetFocus.startTarget,
        planetFocus.targetTarget,
        t
    );

    controls.update();

    if(raw>=1){
        planetFocus.active=false;

        /*
         * Snap target exactly to the planet center.
         */
        if(planetFocus.planet){
            const exactPosition=
                new THREE.Vector3();

            planetFocus.planet.getWorldPosition(
                exactPosition
            );

            controls.target.copy(
                exactPosition
            );

            controls.update();
        }
    }
}

let orbitDragMoved=false;
let orbitPointerDown=false;
let orbitDragStartX=0;
let orbitDragStartY=0;
function pickPlanet(event){
    /*
     * Rotation drag must NEVER become a planet/space click.
     */
    if(orbitDragMoved){
        orbitDragMoved=false;
        return;
    }

    const rect=
        renderer.domElement
            .getBoundingClientRect();

    const mouseX=
        event.clientX-
        rect.left;

    const mouseY=
        event.clientY-
        rect.top;

    const planets=
        getMarvillPlanets();

    let selectedPlanet=null;
    let selectedDistance=Infinity;

    const worldPosition=
        new THREE.Vector3();

    const projected=
        new THREE.Vector3();

    for(const planet of planets){
        planet.getWorldPosition(
            worldPosition
        );

        projected
            .copy(worldPosition)
            .project(camera);

        /*
         * Ignore planets behind the camera.
         */
        if(
            projected.z<-1 ||
            projected.z>1
        ){
            continue;
        }

        const screenX=
            (projected.x*.5+.5)*
            rect.width;

        const screenY=
            (-projected.y*.5+.5)*
            rect.height;

        const dx=
            mouseX-screenX;

        const dy=
            mouseY-screenY;

        const distance=
            Math.sqrt(
                dx*dx+
                dy*dy
            );

        /*
         * Calculate the approximate visible size of
         * this planet in screen pixels.
         */
        const planetRadius=
            planet.userData.planetRadius ||
            .5;

        const cameraDistance=
            camera.position.distanceTo(
                worldPosition
            );

        const fov=
            THREE.MathUtils.degToRad(
                camera.fov
            );

        const pixelsPerWorldUnit=
            rect.height/
            (
                2*
                Math.tan(fov/2)*
                Math.max(
                    cameraDistance,
                    .001
                )
            );

        const visibleRadius=
            planetRadius*
            pixelsPerWorldUnit;

        /*
         * Minimum 18px hit area makes small distant
         * particle planets easy to click.
         *
         * For larger/near planets the clickable area
         * grows with the actual visible sphere.
         */
        const hitRadius=
            Math.max(
                18,
                visibleRadius*1.65
            );

        if(
            distance<=hitRadius &&
            distance<selectedDistance
        ){
            selectedPlanet=planet;
            selectedDistance=distance;
        }
    }

    /*
     * PLANET CLICK
     */
    if(selectedPlanet){
        focusPlanet(
            selectedPlanet
        );

        return;
    }

    /*
     * REAL EMPTY-SPACE CLICK
     */
    returnToUniverse();
}
renderer.domElement.addEventListener(
    'pointerdown',
    event=>{
        orbitPointerDown=true;
        orbitDragMoved=false;
        orbitDragStartX=event.clientX;
        orbitDragStartY=event.clientY;

        /*
         * Manual interaction takes ownership from any
         * currently running focus animation.
         */
        planetFocus.active=false;
    }
);

renderer.domElement.addEventListener(
    'pointermove',
    event=>{
        /*
         * Mouse movement without holding the button
         * is NOT a drag.
         */
        if(!orbitPointerDown){
            return;
        }

        const dx=
            event.clientX-
            orbitDragStartX;

        const dy=
            event.clientY-
            orbitDragStartY;

        if(
            Math.abs(dx)>4 ||
            Math.abs(dy)>4
        ){
            orbitDragMoved=true;
        }
    }
);

renderer.domElement.addEventListener(
    'pointerup',
    ()=>{
        orbitPointerDown=false;
    }
);

renderer.domElement.addEventListener(
    'pointercancel',
    ()=>{
        orbitPointerDown=false;
        orbitDragMoved=false;
    }
);

renderer.domElement.addEventListener(
    'pointerleave',
    ()=>{
        orbitPointerDown=false;
    }
);

renderer.domElement.addEventListener(
    'click',
    pickPlanet
);
function animate(){
    /*
     * Planet camera focus transition.
     */
    updatePlanetFocus(
        Math.min(
            planetFocusClock.getDelta(),
            .05
        )
    );

    requestAnimationFrame(
        animate
    );

    const time=
        clock.getElapsedTime();

    controls.update();

    const sphere=
        coreGroup.getObjectByName(
            'galaxySphere'
        );

    if(sphere){
        sphere.rotation.y=
            time*.055;

        sphere.rotation.x=
            Math.sin(
                time*.18
            )*.08;
    }

    /*
     * Rings rotate around the ACTUAL sphere.
     * They are no longer a flattened PNG layer.
     */

    for(
        let i=0;
        i<planets.length;
        i++
    ){
        const planet=
            planets[i];

        const data=
            planet.userData;

        const a=
            data.angle+
            time*
            data.speed;

        planet.position.set(
            Math.cos(a)*
            data.radius,

            Math.sin(
                a*1.15
            )*
            Math.sin(
                data.tilt
            )*
            3.2,

            Math.sin(a)*
            data.radius
        );

        planet.rotation.y=
            time*.3;
    }

    const stars=
        scene.getObjectByName(
            'stars'
        );

    if(stars){
        stars.rotation.y=
            time*.003;
    }

    coreGroup.position.y=
        Math.sin(
            time*.45
        )*.06;

    orbitGroup.position.y=
        coreGroup.position.y;

    decorationGroup.position.y=
        coreGroup.position.y;

    composer.render();
}

/* ==================================================
   BUILD
================================================== */

createStars();

createGalaxySphere();

createOrbits();


/*
 * CLEAN LEGACY PLANETS
 *
 * At this point the nine orbit rings already exist.
 * Preserve THREE.Points orbit rings, but remove legacy
 * THREE.Group planet objects previously attached to
 * orbitGroup.
 *
 * The new nine Marvill planets are created immediately
 * afterward.
 */

for(const child of [...orbitGroup.children]){
    if(child.isGroup){
        orbitGroup.remove(child);
    }
}

/*
 * CLEAN LEGACY PLANETS
 *
 * At this point the nine orbit rings already exist.
 * Preserve THREE.Points orbit rings, but remove legacy
 * THREE.Group planet objects previously attached to
 * orbitGroup.
 *
 * The new nine Marvill planets are created immediately
 * afterward.
 */

for(const child of [...orbitGroup.children]){
    if(child.isGroup){
        orbitGroup.remove(child);
    }
}

createMarvillPlanets();


createParticleStar(
    9.4,
    1.25
);

createParticleStar(
    -9.4,
    1.25
);

state.textContent=
    'TRUE 3D CORE';

if(loader){
    loader.style.opacity='0';

    setTimeout(()=>{
        loader.style.display='none';
    },800);
}

window.addEventListener(
    'resize',
    ()=>{
        camera.aspect=
            innerWidth/
            innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            innerWidth,
            innerHeight
        );

        composer.setSize(
            innerWidth,
            innerHeight
        );
    }
);

animate();












































