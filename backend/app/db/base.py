"""
Declarative base + import hub for all models.

Alembic's autogenerate needs every model imported somewhere it can see, so this module
exists purely to import them. Owner: Smarak — add new models' imports here as they're
created.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so Base.metadata is aware of every table before Alembic autogenerates.
from app.models.category import Category        # noqa: E402,F401
from app.models.place import Place               # noqa: E402,F401
from app.models.place_image import PlaceImage    # noqa: E402,F401
from app.models.transport import (               # noqa: E402,F401
    TransportProvider, TransportProviderSource, Stop, Route, RouteStop,
    ScheduledTrip, ScheduledTripGroup, FareRule,
)
from app.models.itinerary import (               # noqa: E402,F401
    Itinerary, ItineraryDay, ItineraryStop, TransportHop,
)
from app.models.user import User                 # noqa: E402,F401
