from abc import ABC, abstractmethod


class BasePlanner(ABC):
    @abstractmethod
    def generate_plan(self, goal: str, level: str) -> dict:
        raise NotImplementedError
