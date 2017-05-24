Installation
============

The easiest way to install the app is to use CompleteSearch the Docker image (below). Otherwise, all installation steps can be seen here_.

Requirements
------------

* Docker_ for Linux/macOS/Windows
* `Docker Compose`_

Installation steps
------------------

Step 0
~~~~~~

Install Docker and Docker Compose.

Step 1
~~~~~~

Clone the repository:

.. code-block:: bash

   git clone https://github.com/anatskiy/docker-completesearch.git
   cd docker-completesearch

Build the images::

   SVN_USERNAME="username" SVN_USERNAME="password" docker-compose build

Where ``SVN_USERNAME`` and ``SVN_PASSWORD`` are your credentials for the CompleteSearch svn repository. `More information`_.

**Note**: You need to escape the username and the password with double quotes "".

Step 2
~~~~~~

Start the services::

   docker-compose up -d

Usage
-----

Open CompleteSearch at ``http://localhost:8000/``

----------

Enter the container::

   docker exec -it dockercompletesearch_app_1 /bin/bash

Run a command inside of the container::

   docker exec -t dockercompletesearch_app_1 <command>

See the app logs::

    docker exec -t dockercompletesearch_app_1 cat app.log

or::

   docker logs dockercompletesearch_app_1

Restart the CompleteSearch server::

   docker exec -t dockercompletesearch_app_1 make stop start

.. _here: https://github.com/anatskiy/docker-completesearch/blob/master/app/Dockerfile
.. _Docker: https://docs.docker.com/engine/installation/
.. _`Docker Compose`: https://docs.docker.com/compose/install/
.. _`More information`: http://ad-wiki.informatik.uni-freiburg.de/completesearch
