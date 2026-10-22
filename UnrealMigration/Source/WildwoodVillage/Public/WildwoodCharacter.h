#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "WildwoodCharacter.generated.h"

class UCameraComponent;
class USpringArmComponent;

UCLASS()
class WILDWOODVILLAGE_API AWildwoodCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    AWildwoodCharacter();

protected:
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;
    void MoveForward(float Value);
    void MoveRight(float Value);
    void Turn(float Value);
    void LookUp(float Value);
    void TryInteract();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    TObjectPtr<USpringArmComponent> CameraBoom;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    TObjectPtr<UCameraComponent> FollowCamera;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Interaction")
    float InteractionDistance = 350.0f;
};
