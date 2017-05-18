include /usr/src/completesearch/Makefile

CS_CODE_DIR = /usr/src/completesearch
DATA_DIR = /usr/src/data
DB = $(DATA_DIR)/input

ENCODING = utf8
LOCALE = en_US.utf8
ENABLE_FUZZY_SEARCH = 1
FUZZY_SEARCH_ALGORITHM = simple
FUZZY_USE_BASELINE = 1
HYB_PREFIX_LENGTH = 3
ENABLE_BINARY_SORT = 0
ENABLE_SYNONYM_SEARCH = 0
PARSE_EXTENDED_DTD = 0
NORMALIZE_WORDS = 1
VERBOSITY = 1
DISABLE_CDATA_TAGS = 1
# USE_SUFFIX_FOR_EXACT_QUERY = 1
# QUERY_TIMEOUT = 1500
SORT = sort -T data -S 1G
SHOW_QUERY_RESULT = 0
# WORDS_FORMAT = ASCIISHELL = /usr/local/bin/bash
# WORDS_FORMAT = BINARY
PARSER=$(CS_CODE_DIR)/parser/CsvParserMain
WORD_SEPARATOR_FRONTEND = :
WORD_SEPARATOR_BACKEND = :
#INFO_DELIMITER = '^]'

DEFAULT_PARSER_OPTIONS = \
	--base-name=$(DB) \
	--encoding=$(ENCODING) \
	--maps-directory=$(CS_CODE_DIR) \
	--normalize-words
	# --no-show-prefix=\"*\"

start::
	@sleep 3
	@curl -s "http://0.0.0.0:$(PORT)/?q=" | head -1

process_input:
	$(MAKE) PARSER_OPTIONS="$(DEFAULT_PARSER_OPTIONS) ${OPTIONS}" pclean-all pall
