
import json

# This script serves as a template for developing heuristic control algorithms.
# It would typically be executed within an AWS Lambda environment.

# Conceptual: Load rules from S3 (passed via environment variable or event)
# s3_client = boto3.client('s3')
# rules_bucket = os.environ.get('RULES_BUCKET')
# rules_key = os.environ.get('RULES_KEY', 'heuristic_rules_v1.json')
# try:
#     response = s3_client.get_object(Bucket=rules_bucket, Key=rules_key)
#     rules_config = json.loads(response['Body'].read().decode('utf-8'))
# except Exception as e:
#     print(f"Error loading rules from S3: {e}")
#     rules_config = {"rules": []} # Default to no rules if loading fails

def evaluate_condition(condition_value, operator, sensor_value):
    """Evaluates a single condition."""
    if operator == ">":
        return sensor_value > condition_value
    elif operator == "<":
        return sensor_value < condition_value
    elif operator == "==":
        return sensor_value == condition_value
    # Add more operators as needed (>=, <=, !=)
    return False

def heuristic_control_algorithm(sensor_inputs, rules_config):
    """
    Applies heuristic rules to sensor inputs to determine an HVAC action.

    :param sensor_inputs: A dictionary of current sensor readings.
                          Example: {'temperature': 26.5, 'occupancy': 1, 'co2_level': 850}
    :param rules_config: A dictionary containing the set of rules.
                         Example: {
                             "rules": [
                                 {
                                     "id": "rule_001",
                                     "description": "High temperature and occupancy, activate cooling.",
                                     "priority": 1,
                                     "conditions_operator": "AND", # "AND" or "OR"
                                     "conditions": [
                                         {"sensor": "temperature", "operator": ">", "value": 25.0},
                                         {"sensor": "occupancy", "operator": ">", "value": 0}
                                     ],
                                     "action": "ACTIVATE_STRONG_COOLING",
                                     "parameters": {"setpoint_celsius": 22.0, "fan_speed": "HIGH"}
                                 },
                                 # ... more rules
                             ]
                         }
    :return: A dictionary representing the determined action and any parameters.
             Example: {"action_id": "ACTIVATE_STRONG_COOLING", "parameters": {"setpoint_celsius": 22.0, "fan_speed": "HIGH"}}
             Returns {"action_id": "NO_ACTION", "parameters": {}} if no rule is matched.
    """
    print(f"Input sensor data: {sensor_inputs}")
    print(f"Using rules configuration: {json.dumps(rules_config, indent=2)}")

    # Sort rules by priority (lower number = higher priority) if priority key exists
    sorted_rules = sorted(rules_config.get("rules", []), key=lambda r: r.get("priority", float('inf')))

    for rule in sorted_rules:
        conditions = rule.get("conditions", [])
        if not conditions:
            continue

        conditions_met_flags = []
        for cond in conditions:
            sensor_name = cond.get("sensor")
            operator = cond.get("operator")
            condition_value = cond.get("value")

            if sensor_name not in sensor_inputs:
                print(f"Warning: Sensor '{sensor_name}' for rule '{rule.get('id', 'N/A')}' not in inputs. Skipping condition.")
                conditions_met_flags.append(False) # Treat missing sensor as condition not met
                continue

            sensor_value = sensor_inputs[sensor_name]
            conditions_met_flags.append(evaluate_condition(condition_value, operator, sensor_value))
        
        # Evaluate based on conditions_operator (AND/OR)
        final_condition_met = False
        operator_logic = rule.get("conditions_operator", "AND").upper()
        if operator_logic == "AND":
            final_condition_met = all(conditions_met_flags)
        elif operator_logic == "OR":
            final_condition_met = any(conditions_met_flags)

        if final_condition_met:
            action_id = rule.get("action", "UNKNOWN_ACTION")
            action_parameters = rule.get("parameters", {})
            print(f"Rule '{rule.get('id','N/A')}' ('{rule.get('description', '')}') matched. Action: {action_id}, Params: {action_parameters}")
            return {"action_id": action_id, "parameters": action_parameters}
            
    print("No heuristic rule matched.")
    return {"action_id": "NO_ACTION", "parameters": {}}

# --- Example Usage (for local testing in IDE / Lambda test event) ---
# This part would be replaced by actual event data in a Lambda.
if __name__ == "__main__":
    mock_sensor_readings = {
        "temperature": 26.0,  # Celsius
        "occupancy": 1,       # Binary (1 for occupied, 0 for empty)
        "co2_level": 900      # ppm
    }

    mock_rules_definition = {
        "rules": [
            {
                "id": "hot_occupied_high_co2",
                "description": "Room is hot, occupied, and CO2 is high. Maximize cooling and ventilation.",
                "priority": 1,
                "conditions_operator": "AND",
                "conditions": [
                    {"sensor": "temperature", "operator": ">", "value": 25.0},
                    {"sensor": "occupancy", "operator": "==", "value": 1},
                    {"sensor": "co2_level", "operator": ">", "value": 800}
                ],
                "action": "SET_HVAC_PROFILE",
                "parameters": {"profile_name": "MAX_COOL_VENT"}
            },
            {
                "id": "warm_occupied",
                "description": "Room is warm and occupied. Standard cooling.",
                "priority": 2,
                "conditions_operator": "AND",
                "conditions": [
                    {"sensor": "temperature", "operator": ">", "value": 24.0},
                    {"sensor": "occupancy", "operator": "==", "value": 1}
                ],
                "action": "ACTIVATE_STANDARD_COOLING",
                "parameters": {"target_temp_celsius": 23.0}
            },
            {
                "id": "empty_warm_standby",
                "description": "Room is empty and warm. Set to standby temperature.",
                "priority": 3,
                "conditions_operator": "AND",
                "conditions": [
                    {"sensor": "temperature", "operator": ">", "value": 26.0},
                    {"sensor": "occupancy", "operator": "==", "value": 0}
                ],
                "action": "SET_STANDBY_MODE",
                "parameters": {"standby_temp_celsius": 25.0}
            }
        ]
    }
    
    determined_action = heuristic_control_algorithm(mock_sensor_readings, mock_rules_definition)
    print(f"\nFinal Determined Action: {determined_action}")

    # Conceptual: In Lambda, you would then publish this action
    # iot_client = boto3.client('iot-data', region_name='your-region')
    # iot_client.publish(
    #     topic='hvac/control/actions',
    #     qos=1,
    #     payload=json.dumps(determined_action)
    # )

# For use as a constant in workbench/page.tsx
heuristicTemplate = """
import json

# This script serves as a template for developing heuristic control algorithms.
# It would typically be executed within an AWS Lambda environment.

# Conceptual: Load rules from S3 (passed via environment variable or event)
# s3_client = boto3.client('s3')
# rules_bucket = os.environ.get('RULES_BUCKET')
# rules_key = os.environ.get('RULES_KEY', 'heuristic_rules_v1.json')
# try:
#     response = s3_client.get_object(Bucket=rules_bucket, Key=rules_key)
#     rules_config = json.loads(response['Body'].read().decode('utf-8'))
# except Exception as e:
#     print(f"Error loading rules from S3: {e}")
#     rules_config = {"rules": []} # Default to no rules if loading fails

def evaluate_condition(condition_value, operator, sensor_value):
    \"\"\"Evaluates a single condition.\"\"\"
    if operator == ">":
        return sensor_value > condition_value
    elif operator == "<":
        return sensor_value < condition_value
    elif operator == "==":
        return sensor_value == condition_value
    # Add more operators as needed (>=, <=, !=)
    return False

def heuristic_control_algorithm(sensor_inputs, rules_config):
    \"\"\"
    Applies heuristic rules to sensor inputs to determine an HVAC action.

    :param sensor_inputs: A dictionary of current sensor readings.
                          Example: {'temperature': 26.5, 'occupancy': 1, 'co2_level': 850}
    :param rules_config: A dictionary containing the set of rules.
                         Example: {
                             "rules": [
                                 {
                                     "id": "rule_001",
                                     "description": "High temperature and occupancy, activate cooling.",
                                     "priority": 1,
                                     "conditions_operator": "AND", # "AND" or "OR"
                                     "conditions": [
                                         {"sensor": "temperature", "operator": ">", "value": 25.0},
                                         {"sensor": "occupancy", "operator": ">", "value": 0}
                                     ],
                                     "action": "ACTIVATE_STRONG_COOLING",
                                     "parameters": {"setpoint_celsius": 22.0, "fan_speed": "HIGH"}
                                 },
                                 # ... more rules
                             ]
                         }
    :return: A dictionary representing the determined action and any parameters.
             Example: {"action_id": "ACTIVATE_STRONG_COOLING", "parameters": {"setpoint_celsius": 22.0, "fan_speed": "HIGH"}}
             Returns {"action_id": "NO_ACTION", "parameters": {}} if no rule is matched.
    \"\"\"
    print(f"Input sensor data: {sensor_inputs}")
    print(f"Using rules configuration: {json.dumps(rules_config, indent=2)}")

    # Sort rules by priority (lower number = higher priority) if priority key exists
    sorted_rules = sorted(rules_config.get("rules", []), key=lambda r: r.get("priority", float('inf')))

    for rule in sorted_rules:
        conditions = rule.get("conditions", [])
        if not conditions:
            continue

        conditions_met_flags = []
        for cond in conditions:
            sensor_name = cond.get("sensor")
            operator = cond.get("operator")
            condition_value = cond.get("value")

            if sensor_name not in sensor_inputs:
                print(f"Warning: Sensor '{sensor_name}' for rule '{rule.get('id', 'N/A')}' not in inputs. Skipping condition.")
                conditions_met_flags.append(False) # Treat missing sensor as condition not met
                continue

            sensor_value = sensor_inputs[sensor_name]
            conditions_met_flags.append(evaluate_condition(condition_value, operator, sensor_value))
        
        # Evaluate based on conditions_operator (AND/OR)
        final_condition_met = False
        operator_logic = rule.get("conditions_operator", "AND").upper()
        if operator_logic == "AND":
            final_condition_met = all(conditions_met_flags)
        elif operator_logic == "OR":
            final_condition_met = any(conditions_met_flags)

        if final_condition_met:
            action_id = rule.get("action", "UNKNOWN_ACTION")
            action_parameters = rule.get("parameters", {})
            print(f"Rule '{rule.get('id','N/A')}' ('{rule.get('description', '')}') matched. Action: {action_id}, Params: {action_parameters}")
            return {"action_id": action_id, "parameters": action_parameters}
            
    print("No heuristic rule matched.")
    return {"action_id": "NO_ACTION", "parameters": {}}

# --- Example Usage (for local testing in IDE / Lambda test event) ---
# This part would be replaced by actual event data in a Lambda.
if __name__ == "__main__":
    mock_sensor_readings = {
        "temperature": 26.0,  # Celsius
        "occupancy": 1,       # Binary (1 for occupied, 0 for empty)
        "co2_level": 900      # ppm
    }

    mock_rules_definition = {
        "rules": [
            {
                "id": "hot_occupied_high_co2",
                "description": "Room is hot, occupied, and CO2 is high. Maximize cooling and ventilation.",
                "priority": 1,
                "conditions_operator": "AND",
                "conditions": [
                    {"sensor": "temperature", "operator": ">", "value": 25.0},
                    {"sensor": "occupancy", "operator": "==", "value": 1},
                    {"sensor": "co2_level", "operator": ">", "value": 800}
                ],
                "action": "SET_HVAC_PROFILE",
                "parameters": {"profile_name": "MAX_COOL_VENT"}
            },
            {
                "id": "warm_occupied",
                "description": "Room is warm and occupied. Standard cooling.",
                "priority": 2,
                "conditions_operator": "AND",
                "conditions": [
                    {"sensor": "temperature", "operator": ">", "value": 24.0},
                    {"sensor": "occupancy", "operator": "==", "value": 1}
                ],
                "action": "ACTIVATE_STANDARD_COOLING",
                "parameters": {"target_temp_celsius": 23.0}
            },
            {
                "id": "empty_warm_standby",
                "description": "Room is empty and warm. Set to standby temperature.",
                "priority": 3,
                "conditions_operator": "AND",
                "conditions": [
                    {"sensor": "temperature", "operator": ">", "value": 26.0},
                    {"sensor": "occupancy", "operator": "==", "value": 0}
                ],
                "action": "SET_STANDBY_MODE",
                "parameters": {"standby_temp_celsius": 25.0}
            }
        ]
    }
    
    determined_action = heuristic_control_algorithm(mock_sensor_readings, mock_rules_definition)
    print(f"\\nFinal Determined Action: {determined_action}")

    # Conceptual: In Lambda, you would then publish this action
    # iot_client = boto3.client('iot-data', region_name='your-region')
    # iot_client.publish(
    #     topic='hvac/control/actions',
    #     qos=1,
    #     payload=json.dumps(determined_action)
    # )
"""

    