#include "WildwoodCharacter.h"
#include "WildwoodInteractable.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Engine/Engine.h"
#include "Engine/World.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "GameFramework/PlayerController.h"
#include "DrawDebugHelpers.h"

AWildwoodCharacter::AWildwoodCharacter()
{
    PrimaryActorTick.bCanEverTick = false;

    GetCapsuleComponent()->InitCapsuleSize(42.0f, 96.0f);
    bUseControllerRotationPitch = false;
    bUseControllerRotationYaw = false;
    bUseControllerRotationRoll = false;

    GetCharacterMovement()->bOrientRotationToMovement = true;
    GetCharacterMovement()->RotationRate = FRotator(0.0f, 500.0f, 0.0f);
    GetCharacterMovement()->JumpZVelocity = 520.0f;
    GetCharacterMovement()->AirControl = 0.25f;
    GetCharacterMovement()->MaxWalkSpeed = 420.0f;

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(RootComponent);
    CameraBoom->TargetArmLength = 0.0f;
    CameraBoom->bUsePawnControlRotation = true;
    CameraBoom->bEnableCameraLag = true;
    CameraBoom->CameraLagSpeed = 12.0f;
    CameraBoom->bDoCollisionTest = true;

    FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
    FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    FollowCamera->bUsePawnControlRotation = false;
}

void AWildwoodCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    PlayerInputComponent->BindAxis("MoveForward", this, &AWildwoodCharacter::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &AWildwoodCharacter::MoveRight);
    PlayerInputComponent->BindAxis("Turn", this, &AWildwoodCharacter::Turn);
    PlayerInputComponent->BindAxis("LookUp", this, &AWildwoodCharacter::LookUp);
    PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    PlayerInputComponent->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);
    PlayerInputComponent->BindAction("Interact", IE_Pressed, this, &AWildwoodCharacter::TryInteract);
}

void AWildwoodCharacter::MoveForward(float Value)
{
    if (Controller && FMath::Abs(Value) > KINDA_SMALL_NUMBER)
    {
        const FRotator YawRotation(0.0f, Controller->GetControlRotation().Yaw, 0.0f);
        AddMovementInput(FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X), Value);
    }
}

void AWildwoodCharacter::MoveRight(float Value)
{
    if (Controller && FMath::Abs(Value) > KINDA_SMALL_NUMBER)
    {
        const FRotator YawRotation(0.0f, Controller->GetControlRotation().Yaw, 0.0f);
        AddMovementInput(FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y), Value);
    }
}

void AWildwoodCharacter::Turn(float Value)
{
    AddControllerYawInput(Value);
}

void AWildwoodCharacter::LookUp(float Value)
{
    AddControllerPitchInput(Value);
}

void AWildwoodCharacter::TryInteract()
{
    if (!FollowCamera) return;

    const FVector Start = FollowCamera->GetComponentLocation();
    const FVector End = Start + FollowCamera->GetForwardVector() * InteractionDistance;
    FHitResult Hit;
    FCollisionQueryParams Params(SCENE_QUERY_STAT(WildwoodInteract), false, this);

    if (GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params))
    {
        AActor* Target = Hit.GetActor();
        if (Target && Target->GetClass()->ImplementsInterface(UWildwoodInteractable::StaticClass()))
        {
            IWildwoodInteractable::Execute_Interact(Target, this);
        }
        else if (GEngine)
        {
            GEngine->AddOnScreenDebugMessage(-1, 2.0f, FColor::Yellow,
                TEXT("This villager or object is not interactive yet."));
        }
    }
    else if (GEngine)
    {
        GEngine->AddOnScreenDebugMessage(-1, 1.0f, FColor::Silver, TEXT("Nothing in reach."));
    }
}
