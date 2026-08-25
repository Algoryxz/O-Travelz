"""Geospatial validation and endpoint-neutral Phase 6A projection boundaries."""


def __getattr__(name: str):
    if name in ("MapProjectionService", "project_map"):
        from app.geospatial.projection import MapProjectionService, project_map
        return {"MapProjectionService": MapProjectionService, "project_map": project_map}[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = ["MapProjectionService", "project_map"]
