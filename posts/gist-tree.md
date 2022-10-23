---
title: 'Gist Implementation of R-Tree'
date: '2021-06-19'
---

This project discusses how spatial data are indexed in spatial databases. The project took inspiration after attending lectures on **Spatial Databases with PostgreSQL/PostGIS**, a course that is lectured by our professor [Dr Hajji Hicham](https://www.linkedin.com/in/dr-hajji-hicham-6601606/).

We have used a development module called [gevel](http://www.sai.msu.su/~megera/wiki/Gevel) to get some insight on how **GiST** implementation of **R-Tree** dynamic index facilitates the indexing of multi-dimensional objects.

We have also used a python library called [psycopg2](https://www.psycopg.org/docs/index.html) to automate R-Tree index visualization, and we used **QGIS** as our client to an existing PostgreSQL database.

Check my LinkedIn [Post](https://www.linkedin.com/posts/selfarissi_gevel-gist-rabrtree-activity-6794681893519400960--QPL?utm_source=share&utm_medium=member_desktop) for more details, and this GitHub repository to look the python code that we used to generate these visualizations: [GiST-Tree](https://github.com/salahelfarissi/GiST-Tree)
