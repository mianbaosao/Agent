from app.agent.base_planner import BasePlanner


class RuleBasedPlanner(BasePlanner):
    def generate_plan(self, goal: str, level: str) -> dict:
        builders = {
            "yearly": self._yearly,
            "monthly": self._monthly,
            "weekly": self._weekly,
            "daily": self._daily,
        }
        return builders.get(level, self._daily)(goal=goal, level=level)

    def _yearly(self, goal: str, level: str) -> dict:
        plans = []
        for month in range(1, 13):
            plans.append(
                {
                    "title": f"第{month}个月目标",
                    "description": f"围绕「{goal}」推进第{month}个月的核心阶段。",
                    "type": "monthly",
                    "children": [
                        {
                            "title": f"第{week}周计划",
                            "description": "明确学习主题、完成练习并复盘输出。",
                            "type": "weekly",
                            "children": [
                                {
                                    "title": f"第{day}天任务",
                                    "description": "学习重点知识，完成一个可验证的小任务。",
                                    "type": "daily",
                                }
                                for day in range(1, 8)
                            ],
                        }
                        for week in range(1, 5)
                    ],
                }
            )
        return self._wrap(goal=goal, level=level, summary="按年度节奏拆解为月、周、日任务。", plans=plans)

    def _monthly(self, goal: str, level: str) -> dict:
        plans = [
            {
                "title": f"第{week}周计划",
                "description": f"围绕「{goal}」完成第{week}周阶段目标。",
                "type": "weekly",
                "children": [
                    {
                        "title": f"第{day}天任务",
                        "description": "完成当天学习、练习和复盘。",
                        "type": "daily",
                    }
                    for day in range(1, 8)
                ],
            }
            for week in range(1, 5)
        ]
        return self._wrap(goal=goal, level=level, summary="按月拆解为4周计划和每日任务建议。", plans=plans)

    def _weekly(self, goal: str, level: str) -> dict:
        plans = [
            {
                "title": f"第{day}天任务",
                "description": f"围绕「{goal}」完成当天可交付成果。",
                "type": "daily",
            }
            for day in range(1, 8)
        ]
        return self._wrap(goal=goal, level=level, summary="按周拆解为7天任务。", plans=plans)

    def _daily(self, goal: str, level: str) -> dict:
        plans = [
            {
                "title": "明确今日目标",
                "description": f"将「{goal}」转化为今天可完成的结果。",
                "type": "daily",
            },
            {
                "title": "执行核心任务",
                "description": "投入一段完整时间完成主要学习或开发任务。",
                "type": "daily",
            },
            {
                "title": "复盘和记录",
                "description": "记录完成情况、问题和下一步行动。",
                "type": "daily",
            },
        ]
        return self._wrap(goal=goal, level=level, summary="拆解为当天任务清单。", plans=plans)

    def _wrap(self, goal: str, level: str, summary: str, plans: list[dict]) -> dict:
        return {
            "goal": goal,
            "level": level,
            "summary": summary,
            "plans": plans,
        }
