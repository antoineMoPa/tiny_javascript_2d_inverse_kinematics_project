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

<div @click="$slidev.nav.next" class="mt-12 py-1" hover:bg="white op-10">
  Press Space for next page <carbon:arrow-right />
</div>

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

  Team Lead / Développeur chez <a href="http://lumen5.com" target="_blank">Lumen5</a>

  GitHub: @antoineMoPa

  Trouvez moi aussi sur LinkedIn 😃
</div>

<div class="clear-both"></div>

## Petit mot sur mon employeur
Lumen5 est une plateforme de création de vidéos
pour les communicateurs B2B (business to business) basée à Vancouver.


---
transition: fade-out
---



# Le contenu

À l'agenda:

- 📚 **Survol des matrices en 5 minutes** - Produit, Identité, matrices de transformation.
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

# 📚 **Survol des matrices en 5 minutes** 

Intro aux matrices

Qu'est-ce qu'une matrice?

Les matrices sont des objects mathématiques.

Elles sont composées de lignes et de colonnes.

En termes de développeur: une table.

Exemple de matrice 3x3:

$M = \begin{bmatrix}
1 & 2 & 3\\
4 & 5 & 6\\
7 & 8 & 9\\
\end{bmatrix}$

---
transition: slide-up
---

# 📚 **Survol des matrices en 5 minutes**

Produit scalaire / dot product 

On multiplie les lignes de m1 par les colonnes de m2.

$M_1 = \begin{bmatrix}
a & b & c\\
d & e & f\\
g & h & i\\
\end{bmatrix}$


$M_2 = \begin{bmatrix}
j & k & l\\
m & n & o\\
p & q & r\\
\end{bmatrix}$

$M_3 = M_1 \cdot M_2 = \begin{bmatrix}
a \cdot j + b \cdot m + c \cdot p & ... & ...\\
... & ... & ... \\
... & ... & ... \\
\end{bmatrix}$

---
transition: slide-up
---

# 📚 **Survol des matrices en 5 minutes**

Identité

N'importe quelle matrice multipliée par l'identité va en resortir intacte.

$I = \begin{bmatrix}
1 & 0 & 0\\
0 & 1 & 0\\
0 & 0 & 1\\
\end{bmatrix}$


$M_1 \cdot I = M_1$


---
transition: slide-up
---

# 📚 **Survol des matrices en 5 minutes** - Matrices de transformation





<PoweredBySlidev mt-10 />
