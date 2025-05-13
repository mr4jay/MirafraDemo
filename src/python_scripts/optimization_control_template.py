
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, LpStatus, value as pulp_value

# This script serves as a template for developing optimization-based control algorithms.
# It typically runs in an AWS Lambda environment, possibly triggered periodically or by events.

# --- Configuration Parameters (Conceptual - passed via event or environment variables) ---
# These would define the optimization problem's specifics.
# Example:
# ENERGY_PRICES_HOURLY = [0.10, 0.12, 0.15, 0.20, 0.18, 0.11]  # $/kWh for next N hours
# COMFORT_TEMP_MIN_C = 20.0  # Celsius
# COMFORT_TEMP_MAX_C = 24.0  # Celsius
# INITIAL_TEMP_C = 22.0      # Current building temperature
# OPTIMIZATION_HORIZON_HOURS = 6 # How many hours ahead to optimize
# HVAC_MAX_CAPACITY_KW = 5.0 # Max power HVAC can draw
# TEMP_CHANGE_PER_KWH = 0.5 # Simplified model: °C change per kWh of energy used (heating/cooling)
# COST_WEIGHT = 0.7 # Weight for energy cost in objective function (0 to 1)
# COMFORT_逸DEVIATION_WEIGHT = 0.3 # Weight for comfort deviation (0 to 1)


def optimize_hvac_control_schedule(
    energy_prices, 
    comfort_min, 
    comfort_max, 
    initial_temp,
    optimization_horizon_hours,
    hvac_max_capacity_kw,
    temp_change_per_kwh, # Positive for heating, negative for cooling adjustment if needed
    cost_weight,
    comfort_deviation_weight,
    target_comfort_temp=None # Optional: if provided, penalize deviation from this specific temp
    ):
    """
    Optimizes HVAC energy usage over a defined horizon to minimize a weighted sum of
    energy cost and deviation from comfort temperature bands.

    :param energy_prices: List of energy prices per time step (e.g., $/kWh for each hour).
    :param comfort_min: Minimum desired temperature (°C).
    :param comfort_max: Maximum desired temperature (°C).
    :param initial_temp: Current indoor temperature (°C).
    :param optimization_horizon_hours: Number of time steps (hours) to optimize for.
    :param hvac_max_capacity_kw: Maximum power (kW) the HVAC system can consume in an hour.
    :param temp_change_per_kwh: Coefficient of temperature change per kWh of energy.
                                This is a simplification; a real model would be more complex.
    :param cost_weight: Weight for minimizing energy cost in the objective function.
    :param comfort_deviation_weight: Weight for minimizing deviation from comfort bounds.
    :param target_comfort_temp: Optional specific target temperature for comfort penalty. If None,
                                 penalty is based on being outside min/max bounds.
    :return: A list of optimal energy usage (kWh) for each time step, or None if no solution.
             Also returns the calculated total cost and average comfort deviation.
    """
    if not (0 <= cost_weight <= 1 and 0 <= comfort_deviation_weight <= 1 and \
            abs(cost_weight + comfort_deviation_weight - 1.0) < 1e-6): # Weights should sum to 1
        # Adjusting weights if they don't sum to 1, or handle error
        print("Warning: cost_weight and comfort_deviation_weight should sum to 1. Normalizing.")
        total_weight = cost_weight + comfort_deviation_weight
        if total_weight > 0:
            cost_weight /= total_weight
            comfort_deviation_weight /= total_weight
        else: # Both are zero, default to equal weighting or raise error
            cost_weight = 0.5
            comfort_deviation_weight = 0.5


    prob = LpProblem("HVAC_Energy_Cost_Comfort_Optimization", LpMinimize)

    # Decision Variables
    # Energy consumption (kWh) for each hour. Assume positive values mean cooling/heating energy.
    # A more complex model might differentiate heating_energy and cooling_energy.
    energy_kwh_vars = [LpVariable(f"energy_kwh_hour_{t}", lowBound=0, upBound=hvac_max_capacity_kw) 
                       for t in range(optimization_horizon_hours)]
    
    # State Variables
    # Temperature (°C) at the end of each hour
    temp_vars = [LpVariable(f"temp_celsius_hour_{t}", cat='Continuous') 
                 for t in range(optimization_horizon_hours)]

    # Auxiliary variables for comfort deviation penalty
    # Deviation below min comfort and above max comfort
    temp_dev_below_min_vars = [LpVariable(f"temp_dev_below_min_h{t}", lowBound=0) for t in range(optimization_horizon_hours)]
    temp_dev_above_max_vars = [LpVariable(f"temp_dev_above_max_h{t}", lowBound=0) for t in range(optimization_horizon_hours)]


    # Objective Function: Minimize weighted sum of total energy cost and comfort deviations
    total_energy_cost_expr = lpSum(energy_prices[t] * energy_kwh_vars[t] for t in range(optimization_horizon_hours))
    
    total_comfort_deviation_expr = lpSum(temp_dev_below_min_vars[t] + temp_dev_above_max_vars[t] 
                                         for t in range(optimization_horizon_hours))

    prob += cost_weight * total_energy_cost_expr + \
            comfort_deviation_weight * total_comfort_deviation_expr, "Weighted_Cost_And_Comfort_Objective"

    # Constraints
    for t in range(optimization_horizon_hours):
        # Temperature transition model (highly simplified)
        # T_new = T_old + Energy_applied * temp_change_coefficient
        # Assumes energy_kwh_vars directly influence temperature.
        # A real model needs to consider building thermal dynamics, external temperature, solar gain etc.
        if t == 0:
            prob += temp_vars[t] == initial_temp + energy_kwh_vars[t] * temp_change_per_kwh
        else:
            prob += temp_vars[t] == temp_vars[t-1] + energy_kwh_vars[t] * temp_change_per_kwh

        # Comfort boundary constraints (soft constraints via objective)
        # temp_vars[t] >= comfort_min - temp_dev_below_min_vars[t]
        # temp_vars[t] <= comfort_max + temp_dev_above_max_vars[t]
        # Or, define deviation directly:
        prob += temp_dev_below_min_vars[t] >= comfort_min - temp_vars[t]
        prob += temp_dev_above_max_vars[t] >= temp_vars[t] - comfort_max

        # If a specific target_comfort_temp is given, we could add another term for deviation from it.
        # For this example, we rely on min/max bounds for simplicity.

    print("Optimization problem defined. Attempting to solve...")
    prob.solve() # Uses default CBC solver, can specify others if installed

    if LpStatus[prob.status] == 'Optimal':
        optimal_energy_kwh_schedule = [pulp_value(e) for e in energy_kwh_vars]
        resulting_temps_celsius = [pulp_value(temp) for temp in temp_vars]
        total_cost_calculated = pulp_value(total_energy_cost_expr)
        total_comfort_deviation_calculated = pulp_value(total_comfort_deviation_expr)
        
        print(f"Optimal solution found. Status: {LpStatus[prob.status]}")
        print(f"  Total Objective Value: {pulp_value(prob.objective)}")
        print(f"  Calculated Total Energy Cost: ${total_cost_calculated:.2f}")
        print(f"  Calculated Total Comfort Deviation Score: {total_comfort_deviation_calculated:.2f}")
        print(f"  Optimal Energy Schedule (kWh/hr): {optimal_energy_kwh_schedule}")
        print(f"  Resulting Temperatures (°C/hr): {resulting_temps_celsius}")
        
        return {
            "status": "Optimal",
            "schedule_kwh": optimal_energy_kwh_schedule,
            "temperatures_celsius": resulting_temps_celsius,
            "total_cost": total_cost_calculated,
            "total_comfort_deviation": total_comfort_deviation_calculated
        }
    else:
        print(f"Optimization failed or no optimal solution found. Status: {LpStatus[prob.status]}")
        return {"status": LpStatus[prob.status], "schedule_kwh": None}


# --- Example Usage (for local testing in IDE / Lambda test event) ---
if __name__ == "__main__":
    # Mock inputs for the optimization
    mock_energy_prices = [0.10, 0.12, 0.15, 0.20, 0.18, 0.11]  # $/kWh for next 6 hours
    mock_comfort_min_c = 20.0
    mock_comfort_max_c = 24.0
    mock_initial_temp_c = 22.5
    mock_horizon_hours = 6
    mock_hvac_max_kw = 5.0
    mock_temp_coeff = 0.8  # °C change per kWh (e.g. cooling effect is -0.8)
    mock_cost_w = 0.6
    mock_comfort_w = 0.4

    print("--- Running HVAC Optimization Example ---")
    optimization_result = optimize_hvac_control_schedule(
        energy_prices=mock_energy_prices,
        comfort_min=mock_comfort_min_c,
        comfort_max=mock_comfort_max_c,
        initial_temp=mock_initial_temp_c,
        optimization_horizon_hours=mock_horizon_hours,
        hvac_max_capacity_kw=mock_hvac_max_kw,
        temp_change_per_kwh=mock_temp_coeff, 
        cost_weight=mock_cost_w,
        comfort_deviation_weight=mock_comfort_w
    )
    
    print("\n--- Optimization Result ---")
    import json
    print(json.dumps(optimization_result, indent=2))

    # Conceptual: In Lambda, results would be stored in DynamoDB
    # dynamodb_client = boto3.resource('dynamodb')
    # output_table = dynamodb_client.Table('AlgorithmOutputs')
    # output_table.put_item(Item={
    #     'timestamp': datetime.utcnow().isoformat(),
    #     'algorithm_type': 'optimization',
    #     'inputs': { ... mock inputs ... }, # Log inputs for audit
    #     'outputs': optimization_result
    # })

# For use as a constant in workbench/page.tsx
optimizationTemplate = """
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, LpStatus, value as pulp_value

# This script serves as a template for developing optimization-based control algorithms.
# It typically runs in an AWS Lambda environment, possibly triggered periodically or by events.

# --- Configuration Parameters (Conceptual - passed via event or environment variables) ---
# Example:
# ENERGY_PRICES_HOURLY = [0.10, 0.12, 0.15, 0.20, 0.18, 0.11]  # $/kWh for next N hours
# COMFORT_TEMP_MIN_C = 20.0  # Celsius
# COMFORT_TEMP_MAX_C = 24.0  # Celsius
# INITIAL_TEMP_C = 22.0      # Current building temperature
# OPTIMIZATION_HORIZON_HOURS = 6 # How many hours ahead to optimize
# HVAC_MAX_CAPACITY_KW = 5.0 # Max power HVAC can draw
# TEMP_CHANGE_PER_KWH = 0.5 # Simplified model: °C change per kWh of energy used (heating/cooling)
# COST_WEIGHT = 0.7 # Weight for energy cost in objective function (0 to 1)
# COMFORT_DEVIATION_WEIGHT = 0.3 # Weight for comfort deviation (0 to 1)


def optimize_hvac_control_schedule(
    energy_prices, 
    comfort_min, 
    comfort_max, 
    initial_temp,
    optimization_horizon_hours,
    hvac_max_capacity_kw,
    temp_change_per_kwh, # Positive for heating, negative for cooling adjustment if needed
    cost_weight,
    comfort_deviation_weight,
    target_comfort_temp=None # Optional: if provided, penalize deviation from this specific temp
    ):
    \"\"\"
    Optimizes HVAC energy usage over a defined horizon to minimize a weighted sum of
    energy cost and deviation from comfort temperature bands.

    :param energy_prices: List of energy prices per time step (e.g., $/kWh for each hour).
    :param comfort_min: Minimum desired temperature (°C).
    :param comfort_max: Maximum desired temperature (°C).
    :param initial_temp: Current indoor temperature (°C).
    :param optimization_horizon_hours: Number of time steps (hours) to optimize for.
    :param hvac_max_capacity_kw: Maximum power (kW) the HVAC system can consume in an hour.
    :param temp_change_per_kwh: Coefficient of temperature change per kWh of energy.
                                This is a simplification; a real model would be more complex.
    :param cost_weight: Weight for minimizing energy cost in the objective function.
    :param comfort_deviation_weight: Weight for minimizing deviation from comfort bounds.
    :param target_comfort_temp: Optional specific target temperature for comfort penalty. If None,
                                 penalty is based on being outside min/max bounds.
    :return: A list of optimal energy usage (kWh) for each time step, or None if no solution.
             Also returns the calculated total cost and average comfort deviation.
    \"\"\"
    if not (0 <= cost_weight <= 1 and 0 <= comfort_deviation_weight <= 1 and \\
            abs(cost_weight + comfort_deviation_weight - 1.0) < 1e-6): # Weights should sum to 1
        # Adjusting weights if they don't sum to 1, or handle error
        print("Warning: cost_weight and comfort_deviation_weight should sum to 1. Normalizing.")
        total_weight = cost_weight + comfort_deviation_weight
        if total_weight > 0:
            cost_weight /= total_weight
            comfort_deviation_weight /= total_weight
        else: # Both are zero, default to equal weighting or raise error
            cost_weight = 0.5
            comfort_deviation_weight = 0.5


    prob = LpProblem("HVAC_Energy_Cost_Comfort_Optimization", LpMinimize)

    # Decision Variables
    # Energy consumption (kWh) for each hour. Assume positive values mean cooling/heating energy.
    # A more complex model might differentiate heating_energy and cooling_energy.
    energy_kwh_vars = [LpVariable(f"energy_kwh_hour_{t}", lowBound=0, upBound=hvac_max_capacity_kw) 
                       for t in range(optimization_horizon_hours)]
    
    # State Variables
    # Temperature (°C) at the end of each hour
    temp_vars = [LpVariable(f"temp_celsius_hour_{t}", cat='Continuous') 
                 for t in range(optimization_horizon_hours)]

    # Auxiliary variables for comfort deviation penalty
    # Deviation below min comfort and above max comfort
    temp_dev_below_min_vars = [LpVariable(f"temp_dev_below_min_h{t}", lowBound=0) for t in range(optimization_horizon_hours)]
    temp_dev_above_max_vars = [LpVariable(f"temp_dev_above_max_h{t}", lowBound=0) for t in range(optimization_horizon_hours)]


    # Objective Function: Minimize weighted sum of total energy cost and comfort deviations
    total_energy_cost_expr = lpSum(energy_prices[t] * energy_kwh_vars[t] for t in range(optimization_horizon_hours))
    
    total_comfort_deviation_expr = lpSum(temp_dev_below_min_vars[t] + temp_dev_above_max_vars[t] 
                                         for t in range(optimization_horizon_hours))

    prob += cost_weight * total_energy_cost_expr + \\
            comfort_deviation_weight * total_comfort_deviation_expr, "Weighted_Cost_And_Comfort_Objective"

    # Constraints
    for t in range(optimization_horizon_hours):
        # Temperature transition model (highly simplified)
        # T_new = T_old + Energy_applied * temp_change_coefficient
        # Assumes energy_kwh_vars directly influence temperature.
        # A real model needs to consider building thermal dynamics, external temperature, solar gain etc.
        if t == 0:
            prob += temp_vars[t] == initial_temp + energy_kwh_vars[t] * temp_change_per_kwh
        else:
            prob += temp_vars[t] == temp_vars[t-1] + energy_kwh_vars[t] * temp_change_per_kwh

        # Comfort boundary constraints (soft constraints via objective)
        # temp_vars[t] >= comfort_min - temp_dev_below_min_vars[t]
        # temp_vars[t] <= comfort_max + temp_dev_above_max_vars[t]
        # Or, define deviation directly:
        prob += temp_dev_below_min_vars[t] >= comfort_min - temp_vars[t]
        prob += temp_dev_above_max_vars[t] >= temp_vars[t] - comfort_max

        # If a specific target_comfort_temp is given, we could add another term for deviation from it.
        # For this example, we rely on min/max bounds for simplicity.

    print("Optimization problem defined. Attempting to solve...")
    prob.solve() # Uses default CBC solver, can specify others if installed

    if LpStatus[prob.status] == 'Optimal':
        optimal_energy_kwh_schedule = [pulp_value(e) for e in energy_kwh_vars]
        resulting_temps_celsius = [pulp_value(temp) for temp in temp_vars]
        total_cost_calculated = pulp_value(total_energy_cost_expr)
        total_comfort_deviation_calculated = pulp_value(total_comfort_deviation_expr)
        
        print(f"Optimal solution found. Status: {LpStatus[prob.status]}")
        print(f"  Total Objective Value: {pulp_value(prob.objective)}")
        print(f"  Calculated Total Energy Cost: ${total_cost_calculated:.2f}")
        print(f"  Calculated Total Comfort Deviation Score: {total_comfort_deviation_calculated:.2f}")
        print(f"  Optimal Energy Schedule (kWh/hr): {optimal_energy_kwh_schedule}")
        print(f"  Resulting Temperatures (°C/hr): {resulting_temps_celsius}")
        
        return {
            "status": "Optimal",
            "schedule_kwh": optimal_energy_kwh_schedule,
            "temperatures_celsius": resulting_temps_celsius,
            "total_cost": total_cost_calculated,
            "total_comfort_deviation": total_comfort_deviation_calculated
        }
    else:
        print(f"Optimization failed or no optimal solution found. Status: {LpStatus[prob.status]}")
        return {"status": LpStatus[prob.status], "schedule_kwh": None}


# --- Example Usage (for local testing in IDE / Lambda test event) ---
if __name__ == "__main__":
    # Mock inputs for the optimization
    mock_energy_prices = [0.10, 0.12, 0.15, 0.20, 0.18, 0.11]  # $/kWh for next 6 hours
    mock_comfort_min_c = 20.0
    mock_comfort_max_c = 24.0
    mock_initial_temp_c = 22.5
    mock_horizon_hours = 6
    mock_hvac_max_kw = 5.0
    mock_temp_coeff = 0.8  # °C change per kWh (e.g. cooling effect is -0.8)
    mock_cost_w = 0.6
    mock_comfort_w = 0.4

    print("--- Running HVAC Optimization Example ---")
    optimization_result = optimize_hvac_control_schedule(
        energy_prices=mock_energy_prices,
        comfort_min=mock_comfort_min_c,
        comfort_max=mock_comfort_max_c,
        initial_temp=mock_initial_temp_c,
        optimization_horizon_hours=mock_horizon_hours,
        hvac_max_capacity_kw=mock_hvac_max_kw,
        temp_change_per_kwh=mock_temp_coeff, 
        cost_weight=mock_cost_w,
        comfort_deviation_weight=mock_comfort_w
    )
    
    print("\\n--- Optimization Result ---")
    import json
    print(json.dumps(optimization_result, indent=2))

    # Conceptual: In Lambda, results would be stored in DynamoDB
    # dynamodb_client = boto3.resource('dynamodb')
    # output_table = dynamodb_client.Table('AlgorithmOutputs')
    # output_table.put_item(Item={
    #     'timestamp': datetime.utcnow().isoformat(),
    #     'algorithm_type': 'optimization',
    #     'inputs': { ... mock inputs ... }, # Log inputs for audit
    #     'outputs': optimization_result
    # })
"""

    