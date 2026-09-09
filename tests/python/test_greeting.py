from tests.python.greeting import hello


def test_hello_greets_by_name() -> None:
    assert hello("AI Agent RPG") == "Hello, AI Agent RPG!"
