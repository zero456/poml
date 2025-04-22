from poml import poml


def test_basic():
    assert poml("<p>Hello, World!</p>") == [{"speaker": "human", "content": "Hello, World!"}]
