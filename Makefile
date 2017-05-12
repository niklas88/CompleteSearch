include /usr/src/completesearch/Makefile

CS_CODE_DIR = /usr/src/completesearch
DATA_DIR = /usr/src/data

DB = $(DATA_DIR)/input

ENCODING = utf8
LOCALE = en_US.utf8
#ENABLE_FUZZY_SEARCH = 1
FUZZY_USE_BASELINE = 1
#ENABLE_BINARY_SORT = 1
#PARSE_EXTENDED_DTD = 0
NORMALIZE_WORDS = 1
VERBOSITY = 1
DISABLE_CDATA_TAGS = 1
USE_SUFFIX_FOR_EXACT_QUERY = 1
QUERY_TIMEOUT = 1500
CLEANUP_BEFORE_PROCESSING = 1
SORT = sort -T data -S 1G
CSV = 1
MULTIPLE_TITLE = 1
WORD_SEPARATOR_FRONTEND = :
WORD_SEPARATOR_BACKEND = :
#INFO_DELIMITER = '^]'

DEFAULT_PARSER_OPTIONS = \
	--base-name=$(DB) \
	--encoding=$(ENCODING) \
	--maps-directory=$(CS_CODE_DIR) \
	--word-part-separator-backend=$(WORD_SEPARATOR_BACKEND) \
	--normalize-words
	# --no-show-prefix=\"*\"

process_input:
	$(MAKE) PARSER_OPTIONS="$(DEFAULT_PARSER_OPTIONS) ${OPTIONS}" pall
	cp $(DATA_DIR)/input.{hybrid,vocabulary,docs.DB} $(CS_BIN_DIR)

delete_input:
	-$(CS_BIN_DIR)/startCompletionServer --kill $(PORT)
	rm -rf $(DATA_DIR)/*
	rm -rf $(CS_BIN_DIR)/input.*

start_server:
	-$(CS_BIN_DIR)/startCompletionServer --kill $(PORT)
	cd $(CS_BIN_DIR) && ./startCompletionServer -r -N -H -C -U \
		-L $(LOCALE) \
		-h $(MAX_SIZE_HISTORY) \
		-v $(VERBOSITY) \
		-o $(QUERY_TIMEOUT) \
		-f $(WORD_SEPARATOR_FRONTEND) \
		-b $(WORD_SEPARATOR_BACKEND) \
		input.hybrid

start_server_debug:
	-$(CS_BIN_DIR)/startCompletionServer --kill $(PORT)
	cd $(CS_BIN_DIR) && ./startCompletionServer -Z -N -H -C -U \
		-L $(LOCALE) \
		-h $(MAX_SIZE_HISTORY) \
		-v $(VERBOSITY) \
		-o $(QUERY_TIMEOUT) \
		-f $(WORD_SEPARATOR_FRONTEND) \
		-b $(WORD_SEPARATOR_BACKEND) \
		input.hybrid
