# CompleteSearch

[![Build Status](https://travis-ci.org/anatskiy/CompleteSearch.svg?branch=develop)](https://travis-ci.org/anatskiy/CompleteSearch)

## Description

This project is my Master Project at the [University of Freiburg](https://www.uni-freiburg.de/).

The main goal was to create an easy-to-use web application, which would take a dataset (CSV, TSV), automatically determine a separator, validate the data (remove rows with a wrong syntax), define search facets, and save the file (pre-processing). Then, use the saved file as an input for the seach engine [CompleteSearch](http://ad-wiki.informatik.uni-freiburg.de/completesearch/FrontPage) (post-processing).

![screenshot](http://i.imgur.com/ZENB6Z8.png)

## Features

- search as you type
- case-insensitive prefix search by default, e.g. `sto` matches *storm* as well as *STOCK*
- exact word search, e.g. `graph$` matches *graph* but not *graphics*
- phrase search, e.g. `deep.learn.neural.netw`
- boolean AND, e.g. `antonio vivaldi`
- boolean OR, e.g. `apple | microsoft`
- facets, filters


## Installation
The easiest way to install the app is to use CompleteSearch the [Docker image](https://github.com/anatskiy/docker-completesearch). Otherwise, all installation steps can be seen [here](https://github.com/anatskiy/docker-completesearch/blob/master/app/Dockerfile).
