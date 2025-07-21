--!strict

local function initialize()
	for _, descendant in game:GetDescendants() do
		if not descendant:IsA("Script") then
			continue
		end
		if descendant.Parent:FindFirstChild(descendant.Name) ~= descendant then
			warn(`Duplicate script found: {descendant.Name}`)
		end
	end
	warn("Finished checking for duplicate scripts.")
end

initialize()
