---
# You can also start simply with 'default'
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://images.unsplash.com/photo-1573865526739-10659fec78a5
# some information about your slides (markdown enabled)
title: |
    Miaou numérique: matrices, robotique et animation 2D
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
---

# Miaou numérique

matrices, robotique et animation 2D

<div class="abs-br m-6 text-xl">
  <button @click="$slidev.nav.openInEditor" title="Open in Editor" class="slidev-icon-btn">
    <carbon:edit />
  </button>
  <a href="https://github.com/slidevjs/slidev" target="_blank" class="slidev-icon-btn">
    <carbon:logo-github />
  </a>
</div>

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
transition: fade-out
---



# Le Présentateur

<div class="mt-10 mb-10">
<img src="https://media.licdn.com/dms/image/v2/D4D03AQHZ_fEV2nH_Sw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1730934290041?e=1740009600&v=beta&t=BxTLhV5u0qHSHq8TGiXmWDklPbIe5tHwF3uMh5AJvoY" 
class="w-40 h-40 rounded-full float-left mr-10">
  Antoine Morin-Paulhus

  Team Lead chez <a href="http://lumen5.com" target="_blank">Lumen5</a>

  GitHub: @antoineMoPa

  Trouvez moi aussi sur LinkedIn 😃
</div>

<div class="clear-both"></div>

## Qu'est-ce que Lumen5?
Lumen5 est une plateforme de création de vidéos
pour les communicateurs B2B basée à Vancouver.


---
transition: fade-out
---



# Le contenu

À l'agenda:

- 📚 **Survol des matrices en 5 minutes** - Produit, Identité, Transformation.
- 🤖 **Représentation des joints d'un robot** - Application des matrices
- 🦾 **Cinématique inverse** - Pseudo inverse.
- 🎥 **Applications en jeux vidéo et cinéma** - Très pratique, la cinématique inverse.
- 🤹 **Démo**
<br>

<!--
Here is another comment.
-->

---
transition: slide-up
---

# 📚 **Intro aux matrices** 

Voici un exemple de matrice:

$M = \begin{bmatrix}
1 & 2 & 3\\
4 & 5 & 6\\
7 & 8 & 9\\
\end{bmatrix}$

En termes de développeur: une table.


```javascript
const M = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
```


---
transition: slide-up
---

# 📚 **Multiplication de matrices**

On multiplie les lignes de m1 par les colonnes de m2.

$
\begin{aligned}
M_1 = \begin{bmatrix}
a & b & c\\
d & e & f\\
g & h & i\\
\end{bmatrix}
,
&&
M_2 = \begin{bmatrix}
j & k & l\\
m & n & o\\
p & q & r\\
\end{bmatrix}
,
&&
M_3 = M_1 \cdot M_2 = \begin{bmatrix}
a \cdot j + b \cdot m + c \cdot p & ... & ...\\
... & ... & ... \\
... & ... & ... \\
\end{bmatrix}
\end{aligned}
$

<br/>

[matrix_multiplication.html](https://antoinemopa.github.io/tiny_javascript_2d_inverse_kinematics_project/matrix_demos/matrix_multiplication.html)

<br/>

Avec math.js:
```javascript
math.multiply(M1, M2);
```

---
transition: slide-up
---


# 📚 Matrices de transformation


Les matrices de transformation permettent de déplacer des vecteurs.

<img src="/images/transform_matrix.svg" alt="image" style="max-height:300px" class="m-auto"/>


<br/>

[Démo matrices de transformation](https://antoinemopa.github.io/tiny_javascript_2d_inverse_kinematics_project/matrix_demos/index.html)

---
transition: slide-up
---


# 📚 **Identité**

<br/>

N'importe quelle matrice multipliée par l'identité va en resortir intacte.

<br/>

$I = \begin{bmatrix}
1 & 0 & 0\\
0 & 1 & 0\\
0 & 0 & 1\\
\end{bmatrix}$

<br/>

$M_1 \cdot I = M_1$


---
transition: slide-up
---

# 📚 **Types de joints**

Les 2 types de joints les plus utilisés en robotique.

<div class="flex justify-center">
<img src="/images/types_joints.svg" alt="image" style="max-height:400px"/>
</div>

---


# 📚 **Exemple réel**


<div class="flex justify-center">
<img src="/images/robots_arms.jpg" alt="image" style="max-height:400px"/>
</div>



---
transition: slide-up
---

# 📚 **Représentation des joints d'un robot**

Chaque joint possède sa matrice de transformation.

![image](./images/joints_robot.svg)


---

# 📚 **Matrice de transformation locale**

Exemple de construction d'une matrice pour un joint pivot en 2D:

```javascript
matriceJoint () {
    const c = Math.cos(this.angle);
    const s = Math.sin(this.angle);
    const x = this.len * c;
    const y = this.len * s;

    // Matrice de rotation sur l'axe des Z + Transformation
    return [
        [c, -s, x],
        [s, c, y],
        [0, 0, 1]
    ];
}
```

---

# 📚 **Matrice de transformation globale**

Exemple de construction d'une matrice pour un joint:

```javascript
transformMatrix() {
    const T = this.matriceJoint();
    cont P = this.parent.transformMatrix();
    return math.multiply(P, T);
}
```

---

# 📚 **Cinématique inverse**

Comment placer les joints pour que l'effecteur terminal atteigne son objectif?
       

<div class="flex justify-center">
<img src="/images/cine_inverse.svg" alt="image" style="max-height:400px"/>
</div>

---

# 📚 **Calcul de l'impact des joints**

Ici, on calcule l'impact d'un changement d'angle sur la position de l'effecteur final:

```javascript
class Bone {
  localEffectorMatrix(deltaAngle = 0) {
      const c = Math.cos(this.angle + deltaAngle);
      const s = Math.sin(this.angle + deltaAngle);
      const x = this.len * c;
      const y = this.len * s;

      return [
            [c, -s, x],
            [s, c, y],
            [0, 0, 1]
      ];
  }

  transformMatrix(deltaAngle = 0) {
      const T = this.localEffectorMatrix(deltaAngle);

      return math.multiply(this.offsetMatrix(), this.parentMatrix(deltaAngle), T);
  }

  // ...
}
```

---

# 📚 **Jacobienne**


```javascript
let bone = this;

while (bone) {
    const matrixPlusDelta = bone.endEffectorMatrix(0.1);
    const matrixMinusDelta = bone.endEffectorMatrix(-0.1);
    const diff = math.subtract(matrixPlusDelta, matrixMinusDelta);

    jacobian.push([
        diff[0][2], // Position x
        diff[1][2], // Position y
    ]);

    if (bone.noIk) {
        break;
    }

    bone = bone.parent;
}
```

---

# 📚 **Cinématique inverse - Algo**

Comment placer les joints pour que l'effecteur terminal atteigne son objectif?
       
Répeter jusqu'à ce que l'erreur soit assez petite:
1. Trouver l'impact d'un changement d'angle de chaque joint sur la position de l'effecteur terminal.
   - On appelle ceci la matrice jacobienne.
2. Calculer l'erreur actuelle de l'effecteur terminal. (delta x, delta y)
3. Modifier les angles de façon à minimiser l'erreur.
   - On utilise l'inverse de la jacobienne pour faire varier les joints dans la bonne direction et au bon taux.


<br/>

```javascript
const deltaThetas = math.multiply(pinv(jacobian), error);
```

---

# Applications de la cinématique inverse

<br/>

* Bras robotiques
* Jeu vidéo
* Cinéma

<img src="./images/sintel-hand.png" style="max-height:200px"/>
<p style="font-size:10px">
By © copyright Blender Foundation / www.sintel.org, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=52098322
</p>

[Exemple blender](https://youtu.be/c1iv0dbtMJ4?t=161)

---

# 📚 **Démo**

* Chaque patte est l'équivalent d'un bras robotique avec deux joints révoluts.
* On déplace le `target` de chaque patte de façon successive pour créer une animation de marche.


<div class="flex justify-center">
<img src="/images/cat.svg" alt="image" style="max-height:280px"/>
</div>

https://antoinemopa.github.io/tiny_javascript_2d_inverse_kinematics_project/?bone_mode&gizmos

---

# 📚 **Démo 2**

<br/>

Démo d'une chaine cinématique d'une longueur arbitraire.


https://antoinemopa.github.io/tiny_javascript_2d_inverse_kinematics_project/long_kinematics_chain.html?bone_mode&bone_quantity=7


---

<PoweredBySlidev mt-10 />
