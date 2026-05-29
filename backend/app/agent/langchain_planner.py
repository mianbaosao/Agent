import os

from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI

from app.agent.base_planner import BasePlanner
from app.agent.output_parser import PlanOutputParser
from app.agent.prompt_template import PLAN_PROMPT
from app.agent.rule_based_planner import RuleBasedPlanner


class LangChainPlanner(BasePlanner):
    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            self._fallback = RuleBasedPlanner()
            self._chain = None
            return

        model = os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
        base_url = os.getenv("OPENAI_BASE_URL") or None
        llm = ChatOpenAI(model=model, api_key=api_key, base_url=base_url)
        json_parser = PlanOutputParser()

        self._fallback = None
        self._chain = (
            PLAN_PROMPT
            | llm
            | StrOutputParser()
            | RunnableLambda(lambda text: json_parser.parse(text))
        )

    def generate_plan(self, goal: str, level: str) -> dict:
        if self._fallback is not None or self._chain is None:
            return RuleBasedPlanner().generate_plan(goal=goal, level=level)

        try:
            plan = self._chain.invoke({"goal": goal, "level": level})
        except Exception:
            return RuleBasedPlanner().generate_plan(goal=goal, level=level)

        plan["goal"] = plan.get("goal") or goal
        plan["level"] = plan.get("level") or level
        return plan
