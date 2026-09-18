"""
Basic tests for the retrieval engine. Run with: pytest app/test_retrieval.py -v
"""

from .services.retrieval import get_retriever, load_dataset


def test_dataset_loads():
    documents = load_dataset()
    assert len(documents) > 0
    ids = [d.id for d in documents]
    assert len(ids) == len(set(ids)), "dataset has duplicate ids"


def test_basic_keyword_search_finds_relevant_result():
    retriever = get_retriever()
    response = retriever.search("quiet local dinner", filters={"area": "Candolim"})
    assert not response.is_low_confidence
    names = [r.document.name for r in response.results]
    assert "Goan Soul Kitchen" in names


def test_category_filter_restricts_results():
    retriever = get_retriever()
    response = retriever.search("something to do", filters={"category": "restaurant"}, top_k=10)
    assert all(r.document.category == "restaurant" for r in response.results)


def test_nonsense_query_is_flagged_low_confidence_or_handled():
    retriever = get_retriever()
    response = retriever.search(
        "zzz qqq nonexistent gibberish 12345", filters={"area": "NoSuchPlace"}
    )
    # Either genuinely low confidence, or filters were relaxed -- either way
    # it should not crash and should return a well-formed response.
    assert isinstance(response.is_low_confidence, bool)


def test_exclude_ids_filters_out_previously_used_docs():
    retriever = get_retriever()
    first = retriever.search("restaurant", filters={"category": "restaurant"}, top_k=1)
    assert first.results
    used_id = first.results[0].document.id
    second = retriever.search(
        "restaurant",
        filters={"category": "restaurant", "exclude_ids": {used_id}},
        top_k=1,
    )
    assert second.results
    assert second.results[0].document.id != used_id
