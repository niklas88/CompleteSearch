Installation
============

The easiest way to install the app is to use CompleteSearch the Docker image (below). Otherwise, all installation steps can be seen here_.


Requirements
------------

* Docker_ for Linux/macOS/Windows


Installation steps
------------------

Step 0
~~~~~~

Install Docker_.

Step 1
~~~~~~

Clone the repository:

.. code-block:: bash

   git clone https://github.com/anatskiy/docker-completesearch.git
   cd docker-completesearch

Build the image::

   docker build \
     -t completesearch \
     --build-arg SVN_USERNAME="username" \
     --build-arg SVN_PASSWORD="password" \
     .

Where ``SVN_USERNAME`` and ``SVN_PASSWORD`` are your credentials for the CompleteSearch svn repository. `More information`_.

**Note**: You need to escape the username and the password with double quotes "".

Step 2
~~~~~~

Run the container::

   docker run -d \
     --name completesearch \
     -p 8000:8000 \
     -p 8888:8888 \
     completesearch \
     python3 manage.py runserver -h 0.0.0.0 -p 8000


Usage
-----

Open CompleteSearch at ``http://localhost:8000/``

----------

Enter the container::

   docker exec -it completesearch /bin/bash

Run a command inside of the container::

   docker exec -d completesearch <command>

See the app logs::

    docker exec -t completesearch cat app.log

or::

   docker logs --tail 100 completesearch


Troubleshooting
---------------

If you see the error ``Cannot get facets for ... CompleteSearch server is not responding.``, try to restart the server::

   docker exec -d completesearch make stop start


.. _here: https://github.com/anatskiy/docker-completesearch/blob/master/Dockerfile
.. _Docker: https://docs.docker.com/engine/installation/
.. _`More information`: http://ad-wiki.informatik.uni-freiburg.de/completesearch
