from relaysecurity_dev import Relay

relay = Relay()


def relay_guard_node(state):
    relay.assert_allowed(state["tool"], state.get("arguments", {}))
    return state
