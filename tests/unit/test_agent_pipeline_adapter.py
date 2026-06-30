from pathlib import Path

from backend.agent.langchain_adapter import run_langchain_mock_agent
from backend.agent.mock_runner import run_mock_agent
from backend.agent.pipeline_adapter import (
    PipelineAdapterBoundary,
    PipelineCapability,
    PipelineCapabilityName,
    PipelineCapabilityStatus,
    get_pipeline_adapter_boundary,
    get_pipeline_capabilities,
    resolve_capability,
)


ADAPTER_PATH = Path("backend/agent/pipeline_adapter.py")


def test_pipeline_adapter_imports() -> None:
    capabilities = get_pipeline_capabilities()
    assert capabilities


def test_capability_map_is_complete() -> None:
    names = {capability.name for capability in get_pipeline_capabilities()}
    assert {
        PipelineCapabilityName.GENERATE_SQL,
        PipelineCapabilityName.VALIDATE_READONLY_SQL,
        PipelineCapabilityName.EXECUTE_READONLY_SQL,
        PipelineCapabilityName.SUMMARIZE_FINDINGS,
        PipelineCapabilityName.BUILD_REPORT,
        PipelineCapabilityName.PROVIDER_FALLBACK,
    }.issubset(names)


def test_capability_serialization() -> None:
    capability = resolve_capability(PipelineCapabilityName.GENERATE_SQL)
    assert isinstance(capability, PipelineCapability)
    assert capability.model_dump()
    assert capability.model_dump_json()

    boundary = get_pipeline_adapter_boundary()
    assert isinstance(boundary, PipelineAdapterBoundary)
    assert boundary.model_dump()
    assert boundary.model_dump_json()


def test_boundary_flags_keep_real_path_disabled() -> None:
    boundary = get_pipeline_adapter_boundary()
    assert boundary.mock_path_supported is True
    assert boundary.real_path_supported is False
    assert boundary.persistence_supported is False
    assert boundary.frontend_supported is False


def test_symbol_resolution_is_safe() -> None:
    for name in [
        PipelineCapabilityName.GENERATE_SQL,
        PipelineCapabilityName.VALIDATE_READONLY_SQL,
        PipelineCapabilityName.EXECUTE_READONLY_SQL,
    ]:
        capability = resolve_capability(name)
        assert capability.status in {
            PipelineCapabilityStatus.AVAILABLE,
            PipelineCapabilityStatus.MISSING,
            PipelineCapabilityStatus.PARTIAL,
        }
        assert capability.risk
        assert capability.notes


def test_known_symbols_are_available() -> None:
    assert resolve_capability(PipelineCapabilityName.GENERATE_SQL).status == PipelineCapabilityStatus.AVAILABLE
    assert (
        resolve_capability(PipelineCapabilityName.VALIDATE_READONLY_SQL).status
        == PipelineCapabilityStatus.AVAILABLE
    )
    assert (
        resolve_capability(PipelineCapabilityName.EXECUTE_READONLY_SQL).status
        == PipelineCapabilityStatus.AVAILABLE
    )
    assert resolve_capability(PipelineCapabilityName.BUILD_REPORT).status == PipelineCapabilityStatus.AVAILABLE


def test_m5_3_1_adapter_does_not_execute_real_pipeline() -> None:
    source = ADAPTER_PATH.read_text(encoding="utf-8")
    forbidden_patterns = [
        "generate_sql" + "(",
        "execute" + "(",
        "build_report" + "(",
        "explain_results" + "(",
        "generate_insights" + "(",
        "_run_with_provider" + "(",
    ]
    for pattern in forbidden_patterns:
        assert pattern not in source


def test_pipeline_adapter_has_no_forbidden_dependencies() -> None:
    source = ADAPTER_PATH.read_text(encoding="utf-8").lower()
    forbidden_terms = [
        "lang" + "graph",
        "lang" + "smith",
        "open" + "ai",
        "req" + "uests",
        "htt" + "px",
    ]
    for term in forbidden_terms:
        assert term not in source


def test_existing_native_and_langchain_mock_paths_still_work() -> None:
    native_run = run_mock_agent("请深入分析销售趋势并给出证据")
    adapter_run = run_langchain_mock_agent("请深入分析销售趋势并给出证据")

    assert native_run.provider_used == "mock"
    assert native_run.is_simulated is True
    assert native_run.tool_calls

    assert adapter_run.provider_used == "mock"
    assert adapter_run.is_simulated is True
    assert adapter_run.tool_calls
