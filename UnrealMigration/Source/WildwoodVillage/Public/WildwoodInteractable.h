#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "WildwoodInteractable.generated.h"

UINTERFACE(BlueprintType)
class UWildwoodInteractable : public UInterface
{
    GENERATED_BODY()
};

class WILDWOODVILLAGE_API IWildwoodInteractable
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Wildwood|Interaction")
    FText GetInteractionPrompt() const;

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category = "Wildwood|Interaction")
    void Interact(AActor* InteractingActor);
};
