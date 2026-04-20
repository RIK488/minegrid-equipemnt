from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

_s = get_settings()
engine = create_async_engine(
    _s.database_url,
    echo=False,
    pool_size=_s.database_pool_size,
    max_overflow=_s.database_max_overflow,
    pool_pre_ping=True,
    pool_timeout=30,
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
