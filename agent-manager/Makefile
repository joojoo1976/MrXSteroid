.PHONY: lint test

lint:
	python3 -m compileall -q agent-manager

test:
	python3 -m unittest discover -s agent-manager/scripts/tests -p "test_*.py"
