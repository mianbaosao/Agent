import os

from app.agent.base_planner import BasePlanner
from app.agent.langchain_planner import LangChainPlanner
from app.agent.rule_based_planner import RuleBasedPlanner


class PlannerFactory:
    @staticmethod
    def create() -> BasePlanner:
        if os.getenv("OPENAI_API_KEY"):
            return LangChainPlanner()
        return RuleBasedPlanner()
